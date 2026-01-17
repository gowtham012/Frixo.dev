"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

// SVG Icon components for reliable rendering
const icons: Record<string, ReactNode> = {
  openai: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  ),
  slack: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  ),
  notion: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.934-.56.934-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.046-.746.326-.746.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
    </svg>
  ),
  gmail: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
    </svg>
  ),
  stripe: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
  // Salesforce - official blue cloud
  salesforce: (
    <svg viewBox="0 0 1000 700" fill="#00A1E0">
      <path d="M416.224 76.763c32.219-33.57 77.074-54.391 126.682-54.391 65.946 0 123.48 36.772 154.12 91.361 26.626-11.896 56.098-18.514 87.106-18.514 118.94 0 215.368 97.268 215.368 217.247 0 119.993-96.428 217.261-215.368 217.261a213.735 213.735 0 0 1-42.422-4.227c-26.981 48.128-78.397 80.646-137.412 80.646-24.705 0-48.072-5.706-68.877-15.853-27.352 64.337-91.077 109.448-165.348 109.448-77.344 0-143.261-48.939-168.563-117.574-11.057 2.348-22.513 3.572-34.268 3.572C75.155 585.74.5 510.317.5 417.262c0-62.359 33.542-116.807 83.378-145.937-10.26-23.608-15.967-49.665-15.967-77.06C67.911 87.25 154.79.5 261.948.5c62.914 0 118.827 29.913 154.276 76.263"/>
    </svg>
  ),
  // Jira - blue gradient stacked shapes
  jira: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.005 1.005 0 0 0 23.013 0z"/>
    </svg>
  ),
  // Figma - colorful F shapes
  figma: (
    <svg viewBox="0 0 38 57" fill="none">
      <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
      <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
      <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
      <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
      <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
    </svg>
  ),
  // Zendesk - official geometric Z icon
  zendesk: (
    <svg viewBox="0 -30.5 256 256" fill="currentColor">
      <path d="M118.249172,51.2326115 L118.249172,194.005605 L0,194.005605 L118.249172,51.2326115 Z M118.249172,2.84217094e-14 C118.249172,32.6440764 91.7686624,59.124586 59.124586,59.124586 C26.4805096,59.124586 0,32.6440764 0,2.84217094e-14 L118.249172,2.84217094e-14 Z M137.750828,194.005605 C137.750828,161.328917 164.198726,134.881019 196.875414,134.881019 C229.552102,134.881019 256,161.361529 256,194.005605 L137.750828,194.005605 Z M137.750828,142.740382 L137.750828,0 L256,0 L137.750828,142.740382 Z"/>
    </svg>
  ),
  // Linear - official logo
  linear: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.03509 12.9431C3.24245 14.9227 4.10472 16.8468 5.62188 18.364C7.13904 19.8811 9.0631 20.7434 11.0428 20.9508L3.03509 12.9431Z"/>
      <path d="M3 11.4938L12.4921 20.9858C13.2976 20.9407 14.0981 20.7879 14.8704 20.5273L3.4585 9.11548C3.19793 9.88771 3.0451 10.6883 3 11.4938Z"/>
      <path d="M3.86722 8.10999L15.8758 20.1186C16.4988 19.8201 17.0946 19.4458 17.6493 18.9956L4.99021 6.33659C4.54006 6.89125 4.16573 7.487 3.86722 8.10999Z"/>
      <path d="M5.66301 5.59517C9.18091 2.12137 14.8488 2.135 18.3498 5.63604C21.8508 9.13708 21.8645 14.8049 18.3907 18.3228L5.66301 5.59517Z"/>
    </svg>
  ),
  // Asana - official three dots logo
  asana: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.78 12.653c-2.882 0-5.22 2.337-5.22 5.218s2.338 5.22 5.22 5.22 5.22-2.339 5.22-5.22-2.338-5.218-5.22-5.218zm-13.56 0c-2.882 0-5.22 2.337-5.22 5.218s2.338 5.22 5.22 5.22 5.22-2.339 5.22-5.22-2.338-5.218-5.22-5.218zM12 .908c-2.882 0-5.22 2.338-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.338-5.22-5.22-5.22z"/>
    </svg>
  ),
  // Google Drive - colorful triangle
  googledrive: (
    <svg viewBox="0 -3 48 48" fill="none">
      <polygon fill="#3777E3" points="8 42 16 28 48 28 40 42"/>
      <polygon fill="#FFCF63" points="32 28 48 28 32 0 16 0"/>
      <polygon fill="#11A861" points="0 28 8 42 24 14 16 0"/>
    </svg>
  ),
  // Shopify - green bag icon
  shopify: (
    <svg viewBox="-3 0 48 48" fill="#95BF47">
      <path d="M233.8471,666.99462 C234.633657,667.77951 235.525036,668.6685 235.525036,668.6685 C235.525036,668.6685 239.195316,668.9415 239.368457,668.9565 C239.54309,668.9715 239.753545,669.105 239.786382,669.3465 C239.819219,669.588 245,704.7915 245,704.7915 L232.287087,707.554966 L233.8471,666.99462 Z M231.896906,665.661214 C231.799504,665.673829 231.715018,665.693029 231.656242,665.7105 C231.624898,665.7195 231.099506,665.883 230.229326,666.153 C229.377057,663.69 227.874018,661.4265 225.230641,661.4265 C225.157504,661.4265 225.081382,661.4295 225.006752,661.434 C224.254487,660.435 223.32311,660 222.518604,660 C216.358684,660 213.415295,667.74 212.492875,671.6715 C210.09876,672.417 208.398699,672.9465 208.182274,673.0155 C206.844913,673.437 206.80312,673.479 206.628487,674.7435 C206.495647,675.702 203,702.8715 203,702.8715 L230.239774,708 L230.268734,707.993705 L231.896906,665.661214 Z M224.805252,667.572 C224.805252,667.6665 224.80376,667.7535 224.80376,667.8405 C223.303707,668.307 221.675291,668.814 220.042397,669.3225 C220.958847,665.7675 222.676819,664.05 224.179857,663.402 C224.557482,664.356 224.805252,665.7255 224.805252,667.572 Z M222.348449,661.6605 C222.615622,661.6605 222.882796,661.752 223.139522,661.929 C221.164825,662.862 219.049824,665.214 218.155762,669.909 C216.849746,670.3155 215.573581,670.713 214.392942,671.0805 C215.439248,667.4985 217.924411,661.6605 222.348449,661.6605 Z M223.409681,682.593 C223.409681,682.593 221.815594,681.738 219.861793,681.738 C216.99602,681.738 216.851238,683.5455 216.851238,684 C216.851238,686.4855 223.296244,687.438 223.296244,693.258 C223.296244,697.836 220.406589,700.785 216.509435,700.785 C211.83315,700.785 209.44202,697.86 209.44202,697.86 L210.694303,693.7035 C210.694303,693.7035 213.1526,695.8245 215.2273,695.8245 C216.58108,695.8245 217.133338,694.752 217.133338,693.969 C217.133338,690.7275 211.84509,690.582 211.84509,685.2555 C211.84509,680.7735 215.046697,676.4355 221.509613,676.4355 C223.999254,676.4355 225.230641,677.1525 225.230641,677.1525 L223.409681,682.593 Z M226.418743,667.338 C226.418743,667.1745 226.420235,667.014 226.420235,666.8385 C226.420235,665.3085 226.208287,664.0755 225.869469,663.099 C227.232204,663.27 228.139699,664.8285 228.723302,666.621 C228.039696,666.834 227.262056,667.0755 226.418743,667.338 Z" transform="translate(-203, -660)"/>
    </svg>
  ),
  // Outlook - Microsoft blue with O
  outlook: (
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="10" y="2" width="20" height="28" rx="2" fill="#0F65B5"/>
      <rect x="10" y="5" width="10" height="10" fill="#32A9E7"/>
      <rect x="10" y="15" width="10" height="10" fill="#167EB4"/>
      <rect x="20" y="15" width="10" height="10" fill="#32A9E7"/>
      <rect x="20" y="5" width="10" height="10" fill="#58D9FD"/>
      <rect y="7" width="18" height="18" rx="2" fill="#0F65B5"/>
      <path d="M14 16.07V15.9C14 13.02 11.93 11 9.02 11C6.09 11 4 13.04 4 15.93V16.1C4 18.98 6.07 21 9 21C11.91 21 14 18.96 14 16.07ZM11.64 16.1C11.64 18.01 10.57 19.16 9.02 19.16C7.47 19.16 6.37 17.98 6.37 16.07V15.9C6.37 13.99 7.45 12.84 9 12.84C10.53 12.84 11.64 14.02 11.64 15.93V16.1Z" fill="white"/>
    </svg>
  ),
  // HubSpot - orange circle with sprocket
  hubspot: (
    <svg viewBox="0 0 1024 1024" fill="none">
      <circle cx="512" cy="512" r="512" fill="#FF7A59"/>
      <path d="M623.8 624.94c-38.23 0-69.24-30.67-69.24-68.51s31-68.52 69.24-68.52 69.26 30.67 69.26 68.52-31 68.51-69.26 68.51m20.74-200.42v-61a46.83 46.83 0 0 0 27.33-42.29v-1.41c0-25.78-21.32-46.86-47.35-46.86h-1.43c-26 0-47.35 21.09-47.35 46.86v1.41a46.85 46.85 0 0 0 27.33 42.29v61a135.08 135.08 0 0 0-63.86 27.79l-169.1-130.17A52.49 52.49 0 0 0 372 309c0-29.21-23.89-52.92-53.4-53s-53.45 23.59-53.48 52.81 23.85 52.88 53.36 52.93a53.29 53.29 0 0 0 26.33-7.09l166.38 128.1a132.14 132.14 0 0 0 2.07 150.3l-50.62 50.1A43.42 43.42 0 1 0 450.1 768c24.24 0 43.9-19.46 43.9-43.45a42.24 42.24 0 0 0-2-12.42l50-49.52a135.28 135.28 0 0 0 81.8 27.47c74.61 0 135.06-59.83 135.06-133.65 0-66.82-49.62-122-114.33-131.91" fill="#ffffff"/>
    </svg>
  ),
};

// App icons organized in orbital rings around the central platform
const innerRing = [
  { name: "OpenAI", color: "#10A37F", slug: "openai" },
  { name: "Slack", color: "#E01E5A", slug: "slack" },
  { name: "Notion", color: "#FFFFFF", slug: "notion" },
  { name: "Gmail", color: "#EA4335", slug: "gmail" },
  { name: "Stripe", color: "#635BFF", slug: "stripe" },
  { name: "GitHub", color: "#FFFFFF", slug: "github" },
];

const outerRing = [
  { name: "Salesforce", color: "#00A1E0", slug: "salesforce", hasOwnColor: true },
  { name: "Jira", color: "#0052CC", slug: "jira", hasOwnColor: false },
  { name: "Figma", color: "#F24E1E", slug: "figma", hasOwnColor: true },
  { name: "Zendesk", color: "#03363D", slug: "zendesk", hasOwnColor: false },
  { name: "Linear", color: "#5E6AD2", slug: "linear", hasOwnColor: false },
  { name: "Asana", color: "#F06A6A", slug: "asana", hasOwnColor: false },
  { name: "Google Drive", color: "#4285F4", slug: "googledrive", hasOwnColor: true },
  { name: "Shopify", color: "#95BF47", slug: "shopify", hasOwnColor: true },
  { name: "Outlook", color: "#0078D4", slug: "outlook", hasOwnColor: true },
  { name: "HubSpot", color: "#FF7A59", slug: "hubspot", hasOwnColor: true },
];

export function Integrations() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Dramatic background lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Central glow behind platform */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-[600px] h-[600px] rounded-full bg-accent-cyan/10 blur-[120px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-[400px] h-[400px] rounded-full bg-accent-purple/8 blur-[100px]" />
        </motion.div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-foreground">One platform.</span>
            <br />
            <span className="gradient-text">Infinite connections.</span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-xl mx-auto">
            Your agents connect to every tool in your stack
          </p>
        </motion.div>

        {/* Main visual - Central platform with orbiting apps */}
        <div className="relative h-[500px] sm:h-[600px] lg:h-[700px]">

          {/* Floating Platform - The hero element */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ margin: "-100px" }}
            transition={{
              duration: 1,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            {/* Glow beneath */}
            <div
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full opacity-60"
              style={{
                background: "radial-gradient(ellipse, rgba(0, 212, 255, 0.4) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            {/* Platform container with dramatic shadow */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-r from-accent-cyan/20 via-accent-purple/20 to-accent-cyan/20 blur-xl opacity-60" />

              {/* Main platform card */}
              <div
                className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-[32px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(15, 15, 30, 0.98) 100%)",
                  boxShadow: `
                    0 50px 100px -20px rgba(0, 0, 0, 0.8),
                    0 30px 60px -15px rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(0, 212, 255, 0.15),
                    inset 0 1px 1px rgba(255, 255, 255, 0.1),
                    inset 0 -1px 1px rgba(0, 0, 0, 0.3)
                  `,
                }}
              >
                {/* Subtle inner gradient */}
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5" />

                {/* Animated border */}
                <div className="absolute inset-0 rounded-[32px] overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-[100%]"
                    style={{
                      background: "conic-gradient(from 0deg, transparent, rgba(0, 212, 255, 0.3), transparent, rgba(168, 85, 247, 0.3), transparent)",
                    }}
                  />
                </div>
                <div
                  className="absolute inset-[1px] rounded-[31px]"
                  style={{
                    background: "linear-gradient(145deg, rgba(30, 30, 50, 0.98) 0%, rgba(15, 15, 30, 1) 100%)",
                  }}
                />

                {/* Platform icon */}
                <div className="relative z-10">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      stroke="url(#platformGradient)"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="platformGradient" x1="4" y1="3" x2="20" y2="21">
                        <stop offset="0%" stopColor="#00D4FF" />
                        <stop offset="100%" stopColor="#FB631B" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Inner ring of apps */}
          <div className="absolute inset-0">
            {innerRing.map((app, index) => {
              const angle = (index * 360) / innerRing.length - 90;
              const radius = 160; // Distance from center
              const x = Math.round(Math.cos((angle * Math.PI) / 180) * radius);
              const y = Math.round(Math.sin((angle * Math.PI) / 180) * radius);

              return (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className="relative group cursor-pointer"
                  >
                    {/* Glow on hover */}
                    <div
                      className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                      style={{ backgroundColor: `${app.color}40` }}
                    />

                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                      style={{
                        background: "linear-gradient(145deg, rgba(30, 30, 45, 0.9) 0%, rgba(20, 20, 35, 0.95) 100%)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                        color: app.color,
                      }}
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8">
                        {icons[app.slug]}
                      </div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <span className="text-xs text-foreground-muted whitespace-nowrap bg-background-elevated/90 px-2 py-1 rounded-lg">
                        {app.name}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Outer ring of apps */}
          <div className="absolute inset-0">
            {outerRing.map((app, index) => {
              const angle = (index * 360) / outerRing.length - 108;
              const radius = 280; // Larger radius
              const x = Math.round(Math.cos((angle * Math.PI) / 180) * radius);
              const y = Math.round(Math.sin((angle * Math.PI) / 180) * radius);

              return (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.7, scale: 1 }}
                  viewport={{ margin: "-100px" }}
                  transition={{
                    duration: 0.6,
                    delay: 0.8 + index * 0.08,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="absolute z-10 hidden sm:block -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, opacity: 1 }}
                    className="relative group cursor-pointer"
                  >
                    <div
                      className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"
                      style={{ backgroundColor: `${app.color}30` }}
                    />

                    <div
                      className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{
                        background: "linear-gradient(145deg, rgba(25, 25, 40, 0.8) 0%, rgba(15, 15, 30, 0.85) 100%)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
                        ...(!app.hasOwnColor && { color: app.color }),
                      }}
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6">
                        {icons[app.slug]}
                      </div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <span className="text-xs text-foreground-dim whitespace-nowrap bg-background-elevated/80 px-2 py-0.5 rounded-md">
                        {app.name}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Orbital rings decoration */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Inner orbital ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] rounded-full border border-accent-cyan/10"
            />

            {/* Outer orbital ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[600px] sm:h-[600px] rounded-full border border-accent-purple/8 hidden sm:block"
            />
          </div>
        </div>

        {/* Bottom text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-8"
        >
          <p className="text-foreground-muted">
            <span className="text-accent-cyan font-medium">100+</span> pre-built integrations.{" "}
            <span className="text-accent-purple font-medium">Any API</span> via custom tools.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
