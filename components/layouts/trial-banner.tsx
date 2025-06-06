import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { useTeam } from "@/context/team-context";
import { PlanEnum } from "@/ee/stripe/constants";
import Cookies from "js-cookie";
import { usePlausible } from "next-plausible";

import { usePlan } from "@/lib/swr/use-billing";
import useDatarooms from "@/lib/swr/use-datarooms";
import { daysLeft } from "@/lib/utils";

import { UpgradePlanModal } from "@/components/billing/upgrade-plan-modal";
import X from "@/components/shared/icons/x";

export default function TrialBanner() {
  const { trial } = usePlan();
  const isTrial = !!trial;
  const [showTrialBanner, setShowTrialBanner] = useState<boolean | null>(null);

  useEffect(() => {
    if (Cookies.get("hideTrialBanner") !== "trial-banner" && isTrial) {
      setShowTrialBanner(true);
    } else {
      setShowTrialBanner(false);
    }
  }, []);

  if (isTrial && showTrialBanner) {
    return <TrialBannerComponent setShowTrialBanner={setShowTrialBanner} />;
  }

  return null;
}

function TrialBannerComponent({
  setShowTrialBanner,
}: {
  setShowTrialBanner: Dispatch<SetStateAction<boolean | null>>;
}) {
  const teamInfo = useTeam();
  const plausible = usePlausible();

  const handleHideBanner = () => {
    setShowTrialBanner(false);
    plausible("clickedHideTrialBanner");
    Cookies.set("hideTrialBanner", "trial-banner", {
      expires: 1,
    });
  };

  const { datarooms } = useDatarooms();

  return (
    <div className="mx-2 my-2 mb-2 rounded-xl border border-gray-900 bg-white p-1 dark:border-gray-600 dark:bg-gray-900">
      <nav className="relative flex flex-col bg-white px-4 py-3 dark:bg-gray-900">
        <button
          type="button"
          onClick={handleHideBanner}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-bold">
            Data Room trial:{" "}
            {datarooms &&
              daysLeft(
                new Date(
                  datarooms[0]?.createdAt ??
                    teamInfo?.currentTeam?.createdAt ??
                    new Date(),
                ),
                7,
              )}{" "}
            days left
          </div>

          <div className="text-sm">
            You are on the <span className="font-bold">Data Rooms</span> plan
            trial, you have access to advanced access controls, group
            permissions, and data room.{" "}
            <UpgradePlanModal
              clickedPlan={PlanEnum.DataRooms}
              trigger={"trial_navbar"}
            >
              <span
                className="cursor-pointer font-bold text-orange-500"
                onClick={() => plausible("clickedUpgradeTrialNavbar")}
              >
                Upgrade to keep access
              </span>
            </UpgradePlanModal>
            , unlock unlimited data rooms and custom domains ✨
          </div>
        </div>
      </nav>
    </div>
  );
}
