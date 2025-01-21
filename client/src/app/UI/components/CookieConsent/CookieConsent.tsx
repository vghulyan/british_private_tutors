"use client";

import React from "react";
import { useDispatch } from "react-redux";
import Button from "../Button/Button";
import { useAppSelector } from "@/state/store/redux";
import {
  selectedConsent,
  setConsent,
} from "@/state/store/helper/slice/cookieSlice";

const CookieConsent: React.FC = () => {
  const dispatch = useDispatch();
  const consent = useAppSelector(selectedConsent);

  const handleAccept = () => {
    dispatch(setConsent("accepted"));
  };

  const handleDecline = () => {
    dispatch(setConsent("declined"));
  };

  // ToDo: Add analytics tools
  // React.useEffect(() => {
  //   if (consent === "accepted") {
  //     console.log("Enable analytics");
  //     // Initialize analytics tools here
  //   } else if (consent === "declined") {
  //     console.log("Disable analytics");
  //   }
  // }, [consent]);

  if (consent !== "undecided") {
    return null; // Don't show the banner if the user has already decided
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-300 border-t border-gray-300 shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row justify-between items-center md:justify-between gap-4">
        <div className="text-sm text-gray-800">
          <div className="flex flex-col gap-2">
            <strong className="block md:inline text-lg">
              We Care About Your Privacy
            </strong>
            <span className="block md:inline">
              We and our 873 partners store and access personal data, like
              browsing data or unique identifiers, on your device. Selecting{" "}
              <strong>&quot;I Accept&quot;</strong> enables tracking
              technologies to support the purposes shown under{" "}
              <strong>
                &quot;we and our partners process data to provide&quot;
              </strong>
              , whereas selecting <strong>&quot;Reject All&quot;</strong> or
              withdrawing your consent will disable them. If trackers are
              disabled, some content and ads you see may not be as relevant to
              you. You can resurface this menu to change your choices or
              withdraw consent at any time by clicking the Manage Preferences
              link on the bottom of the webpage{" "}
              <em>
                [or the floating icon on the bottom-left of the webpage, if
                applicable]
              </em>
              . Your choices will have effect within our Website. For more
              details, refer to our{" "}
              <a
                href="/our-school/legal/privacy-policy"
                className="text-indigo-600 hover:underline"
              >
                Privacy Policy
              </a>
              . You can view our privacy policy page for more information.
            </span>
            <br />
            <strong>We and our partners process data to provide:</strong>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Use precise geolocation data.</li>
              <li>Actively scan device characteristics for identification.</li>
              <li>Store and/or access information on a device.</li>
              <li>
                Personalised advertising and content, advertising and content
                measurement, audience research, and services development.
              </li>
            </ul>
            {/* <a
              href="/vendors"
              className="text-indigo-600 hover:underline block mt-2"
            >
              List of Partners (vendors)
            </a> */}
          </div>
        </div>
        <div className="flex gap-2">
          <Button label="Accept All" onClick={handleAccept} />
          <Button
            type="button"
            label="Decline"
            onClick={handleDecline}
            className="bg-gray-500 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
