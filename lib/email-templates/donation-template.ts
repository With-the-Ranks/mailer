export interface EmailProps {
  logoUrl: string;
}

export const DonationTemplate = ({ logoUrl: logoUrl }: EmailProps) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" lang="en"><head><meta content="width=device-width" name="viewport"/><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><meta content="IE=edge" http-equiv="X-UA-Compatible"/><meta name="x-apple-disable-message-reformatting"/><meta content="telephone=no,address=no,email=no,date=no,url=no" name="format-detection"/><meta content="light" name="color-scheme"/><meta content="light" name="supported-color-schemes"/><style>
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            mso-font-alt: 'sans-serif';
            src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
          }

          * {
            font-family: 'Inter', sans-serif;
          }
        </style><style>blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}</style></head><body><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;min-width:300px;width:100%;margin-left:auto;margin-right:auto;padding:0.5rem"><tbody><tr style="width:100%"><td><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:0px;margin-bottom:32px"><tbody style="width:100%"><tr style="width:100%"><td align="left" data-id="__react-email-column"><img title="Logo" alt="Logo" src="${logoUrl}" data-maily-component="logo" data-size="lg" data-alignment="center" style="display:block;outline:none;border:none;text-decoration:none;width:auto!important;height:48px"/></td></tr></tbody></table><p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:rgb(55, 65, 81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">Dear Friend,</p><p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:rgb(55, 65, 81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">I’m John Smith, and I’m running for City Council because I believe we can make our community a better place to live. Our city is facing challenges, and the decisions we make now will shape our future. If elected, I’ll work to keep our neighborhoods safe, support local businesses, invest in our kids, and improve our public spaces.</p><p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:rgb(55, 65, 81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">But I can’t do it alone. Running a strong campaign takes resources, and I need your help. Even a small contribution, like $10, can make a big difference.</p><p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:rgb(55, 65, 81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">Would you consider donating today to help us build a better future?</p><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;text-align:center;margin-bottom:20px"><tbody><tr style="width:100%"><td><a href="" style="color:rgb(255, 255, 255);background-color:#052e4e;border-color:#052e4e;padding:12px 34px 12px 34px;border-width:2px;border-style:solid;text-decoration:none;font-size:14px;font-weight:500;border-radius:9999px;line-height:100%;display:inline-block;max-width:100%" target="_blank"><span><!--[if mso]><i style="letter-spacing: 34px;mso-font-width:-100%;mso-text-raise:18" hidden>&nbsp;</i><![endif]--></span><a data-maily-component="button" mailycomponent="button" text="Donate $10 →" url="http://google.com" alignment="center" variant="filled" borderradius="round" buttoncolor="#0170cb" textcolor="#ffffff"></a><span><!--[if mso]><i style="letter-spacing: 34px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td></tr></tbody></table><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;text-align:center;margin-bottom:20px"><tbody><tr style="width:100%"><td><a href="#" style="color:rgb(255, 255, 255);background-color:#052e4e;border-color:#052e4e;padding:12px 34px 12px 34px;border-width:2px;border-style:solid;text-decoration:none;font-size:14px;font-weight:500;border-radius:9999px;line-height:100%;display:inline-block;max-width:100%" target="_blank"><span><!--[if mso]><i style="letter-spacing: 34px;mso-font-width:-100%;mso-text-raise:18" hidden>&nbsp;</i><![endif]--></span><a data-maily-component="button" mailycomponent="button" text="Donate $27 →" url="http://google.com" alignment="center" variant="filled" borderradius="round" buttoncolor="#0170cb" textcolor="#ffffff"></a><span><!--[if mso]><i style="letter-spacing: 34px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td></tr></tbody></table><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:100%;text-align:center;margin-bottom:20px"><tbody><tr style="width:100%"><td><a href="#" style="color:rgb(255, 255, 255);background-color:#052e4e;border-color:#052e4e;padding:12px 34px 12px 34px;border-width:2px;border-style:solid;text-decoration:none;font-size:14px;font-weight:500;border-radius:9999px;line-height:100%;display:inline-block;max-width:100%" target="_blank"><span><!--[if mso]><i style="letter-spacing: 34px;mso-font-width:-100%;mso-text-raise:18" hidden>&nbsp;</i><![endif]--></span><a data-maily-component="button" mailycomponent="button" text="Donate $100 →" url="http://google.com" alignment="center" variant="filled" borderradius="round" buttoncolor="#0170cb" textcolor="#ffffff"></a><span><!--[if mso]><i style="letter-spacing: 34px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td></tr></tbody></table><p style="font-size:15px;line-height:24px;margin:16px 0;text-align:left;margin-bottom:20px;margin-top:0px;color:rgb(55, 65, 81);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">Thank you so much for your support. Together, we can make this happen!</p></td></tr></tbody></table></body></html>`;
};

export const DonationJSON = ({ logoUrl: logoUrl }: EmailProps) => {
  return {
    type: "doc",
    content: [
      {
        type: "logo",
        attrs: {
          src: logoUrl,
          alt: "Logo",
          title: "Logo",
          "maily-component": "logo",
          size: "lg",
          alignment: "center",
        },
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [{ type: "text", text: "Dear Friend," }],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "I’m John Smith, and I’m running for City Council because I believe we can make our community a better place to live. Our city is facing challenges, and the decisions we make now will shape our future. If elected, I’ll work to keep our neighborhoods safe, support local businesses, invest in our kids, and improve our public spaces.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "But I can’t do it alone. Running a strong campaign takes resources, and I need your help. Even a small contribution, like $10, can make a big difference.",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Would you consider donating today to help us build a better future?",
          },
        ],
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Donate $10 →",
          url: "http://google.com",
          alignment: "center",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#0170cb",
          textColor: "#ffffff",
        },
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Donate $27 →",
          url: "http://google.com",
          alignment: "center",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#0170cb",
          textColor: "#ffffff",
        },
      },
      {
        type: "button",
        attrs: {
          mailyComponent: "button",
          text: "Donate $100 →",
          url: "http://google.com",
          alignment: "center",
          variant: "filled",
          borderRadius: "round",
          buttonColor: "#0170cb",
          textColor: "#ffffff",
        },
      },
      {
        type: "paragraph",
        attrs: { textAlign: "left" },
        content: [
          {
            type: "text",
            text: "Thank you so much for your support. Together, we can make this happen!",
          },
        ],
      },
    ],
  };
};
