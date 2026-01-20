"use client";

import { HelpPanel } from "@/components/ui/help-panel";

export function HelpSidebar() {
  return (
    <HelpPanel title="Help / Emails">
      {/* Email Name Section */}
      <div>
        <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">
          Email Name
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Email name is an internal name visible only to your organization so
          you can easily identify this email in the future.
        </p>
      </div>

      {/* Naming Best Practices */}
      <div>
        <h4 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
          Naming Best Practices
        </h4>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
          While you're free to name your email whatever you'd like, it can be
          helpful to keep a consistent format to make analysis and tracking
          easier in the future. Here's a few tips from us:
        </p>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>
            Be descriptive about what the email is for, such as{" "}
            <span className="font-medium">
              Phonebanking Kickoff Party at Pizza Pub
            </span>{" "}
            or <span className="font-medium">GOTV Early-Vote</span>
          </li>
          <li>
            Consider starting with the date in a consistent format, like{" "}
            <span className="font-medium">251003 Organizing Kickoff</span>.
          </li>
          <li>
            Consider including information about your target audience, such as{" "}
            <span className="font-medium">Townshend, VT 35 miles</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Remember, this name is just for your organization, so do what works
          best for you.
        </p>
      </div>

      {/* Want More Section */}
      <div className="rounded-lg bg-blue-600 p-4">
        <p className="mb-2 text-sm font-medium text-white">Want more?</p>
        <p className="text-sm text-white">
          Check out our guides or send us a message under the{" "}
          <a
            href="/docs"
            className="font-semibold underline hover:no-underline"
          >
            Support
          </a>{" "}
          tab.
        </p>
      </div>
    </HelpPanel>
  );
}
