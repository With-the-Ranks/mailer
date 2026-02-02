import {
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  DeleteConfigurationSetCommand,
  EventType,
} from "@aws-sdk/client-sesv2";
import { CreateTopicCommand, SubscribeCommand } from "@aws-sdk/client-sns";

import { getSesClient } from "./ses-client";
import { getSnsClient } from "./sns-client";

// Base events that are always tracked
const GENERAL_EVENTS: EventType[] = [
  "BOUNCE",
  "COMPLAINT",
  "DELIVERY",
  "DELIVERY_DELAY",
  "REJECT",
  "RENDERING_FAILURE",
  "SEND",
];

export interface ConfigSetResult {
  success: boolean;
  configSetName?: string;
  error?: string;
}

export interface SnsTopicResult {
  success: boolean;
  topicArn?: string;
  error?: string;
}

// Create an SNS topic for SES events and subscribe the webhook endpoint
export async function setupSnsForSes(
  region: string,
  callbackUrl: string,
  topicName: string = "mailer-ses-events",
): Promise<SnsTopicResult> {
  try {
    const snsClient = getSnsClient(region);

    // Create SNS topic with region suffix
    const topicResponse = await snsClient.send(
      new CreateTopicCommand({
        Name: `${topicName}-${region}`,
      }),
    );

    const topicArn = topicResponse.TopicArn;
    if (!topicArn) {
      return {
        success: false,
        error: "Failed to create SNS topic - no ARN returned",
      };
    }

    // Subscribe HTTPS endpoint
    await snsClient.send(
      new SubscribeCommand({
        Protocol: "https",
        TopicArn: topicArn,
        Endpoint: `${callbackUrl}/api/ses-webhook`,
      }),
    );

    return {
      success: true,
      topicArn,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error setting up SNS";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Create configuration set with SNS event destination
export async function createConfigurationSet(
  name: string,
  topicArn: string,
  region: string,
  eventTypes: EventType[] = GENERAL_EVENTS,
): Promise<ConfigSetResult> {
  const sesClient = getSesClient(region);

  try {
    // Create configuration set
    await sesClient.send(
      new CreateConfigurationSetCommand({
        ConfigurationSetName: name,
      }),
    );

    // Add SNS destination for events
    try {
      await sesClient.send(
        new CreateConfigurationSetEventDestinationCommand({
          ConfigurationSetName: name,
          EventDestinationName: "sns_destination",
          EventDestination: {
            Enabled: true,
            MatchingEventTypes: eventTypes,
            SnsDestination: { TopicArn: topicArn },
          },
        }),
      );
    } catch (eventDestError) {
      console.error(
        `Failed to create event destination for ${name}, rolling back configuration set`,
        eventDestError,
      );
      try {
        await sesClient.send(
          new DeleteConfigurationSetCommand({
            ConfigurationSetName: name,
          }),
        );
        console.log(`Rollback successful: deleted configuration set ${name}`);
      } catch (rollbackError) {
        console.error(
          `Rollback failed: could not delete configuration set ${name}`,
          rollbackError,
        );
      }
      // Re-throw the original error
      throw eventDestError;
    }

    return {
      success: true,
      configSetName: name,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error creating config set";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Delete a configuration set
export async function deleteConfigurationSet(
  name: string,
  region: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const sesClient = getSesClient(region);

    await sesClient.send(
      new DeleteConfigurationSetCommand({
        ConfigurationSetName: name,
      }),
    );

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error deleting config set";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Set up all four configuration sets for different tracking levels
export async function setupAllConfigurationSets(
  topicArn: string,
  region: string,
  prefix: string = "mailer",
): Promise<{
  configGeneral?: string;
  configClick?: string;
  configOpen?: string;
  configFull?: string;
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    configGeneral?: string;
    configClick?: string;
    configOpen?: string;
    configFull?: string;
  } = {};

  // 1. General config - base events only
  const generalResult = await createConfigurationSet(
    `${prefix}-general`,
    topicArn,
    region,
    GENERAL_EVENTS,
  );
  if (generalResult.success) {
    results.configGeneral = generalResult.configSetName;
  } else {
    errors.push(`General: ${generalResult.error}`);
  }

  // 2. Click config - base + CLICK
  const clickResult = await createConfigurationSet(
    `${prefix}-click`,
    topicArn,
    region,
    [...GENERAL_EVENTS, "CLICK"],
  );
  if (clickResult.success) {
    results.configClick = clickResult.configSetName;
  } else {
    errors.push(`Click: ${clickResult.error}`);
  }

  // 3. Open config - base + OPEN
  const openResult = await createConfigurationSet(
    `${prefix}-open`,
    topicArn,
    region,
    [...GENERAL_EVENTS, "OPEN"],
  );
  if (openResult.success) {
    results.configOpen = openResult.configSetName;
  } else {
    errors.push(`Open: ${openResult.error}`);
  }

  // 4. Full config - base + CLICK + OPEN
  const fullResult = await createConfigurationSet(
    `${prefix}-full`,
    topicArn,
    region,
    [...GENERAL_EVENTS, "CLICK", "OPEN"],
  );
  if (fullResult.success) {
    results.configFull = fullResult.configSetName;
  } else {
    errors.push(`Full: ${fullResult.error}`);
  }

  return { ...results, errors };
}

// Get the appropriate configuration set name based on tracking settings
export function getConfigurationSetName(
  clickTracking: boolean,
  openTracking: boolean,
  prefix: string = "mailer",
): string {
  if (clickTracking && openTracking) return `${prefix}-full`;
  if (clickTracking) return `${prefix}-click`;
  if (openTracking) return `${prefix}-open`;
  return `${prefix}-general`;
}
