'use client'

import type { FC, HTMLAttributes } from "react";
import { MessageCircle, Zap, BarChart3 } from "lucide-react";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { CheckItemText } from "@/components/marketing/pricing-sections/base-components/pricing-tier-card";
import { cx } from "@/utils/cx";

const AlternateImageMockup: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div
      className={cx(
        "size-full rounded-[9.03px] bg-primary p-[0.9px] shadow-lg ring-[0.56px] ring-gray-300 ring-inset md:rounded-[20.08px] md:p-0.5 md:ring-[1.25px] lg:absolute lg:w-auto lg:max-w-none",
        props.className,
      )}
    >
      <div className="size-full rounded-[7.9px] bg-primary p-0.5 shadow-inner md:rounded-[17.57px] md:p-[3.5px]">
        <div className="relative size-full overflow-hidden rounded-[6.77px] ring-[0.56px] ring-gray-200 md:rounded-[15.06px] md:ring-[1.25px]">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export const FeaturesAlternatingLayout01 = () => {
  return (
    <section className="flex flex-col gap-12 overflow-hidden bg-white py-16 dark:bg-gray-900 sm:gap-16 md:gap-20 md:py-24 lg:gap-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 md:text-base">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100 md:text-4xl lg:text-5xl">
            Beautiful analytics to grow smarter
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 md:mt-5 md:text-xl">
            Powerful, self-serve product and growth analytics to help you convert, engage, and retain more users. Trusted by over 4,000 startups.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:gap-16 md:gap-20 md:px-8 lg:gap-24">
        {/* Feature 1 */}
        <div className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 lg:gap-24">
          <div className="max-w-xl flex-1 self-center">
            <FeaturedIcon icon={MessageCircle} size="lg" color="brand" theme="light" />
            <h2 className="mt-5 text-2xl font-semibold text-gray-900 dark:text-gray-100 md:text-3xl">
              Share team inboxes
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:mt-4 md:text-lg">
              Whether you have a team of 2 or 200, our shared team inboxes keep everyone on the same page and in the loop.
            </p>
            <ul className="mt-8 flex flex-col gap-4 pl-2 md:gap-5 md:pl-4">
              {[
                "Leverage automation to move fast",
                "Always give customers a human to chat to",
                "Automate customer support and close leads faster",
              ].map((feat) => (
                <CheckItemText key={feat} size="md" iconStyle="outlined" color="primary" text={feat} />
              ))}
            </ul>
          </div>
          <div className="relative w-full flex-1 lg:h-[512px]">
            <AlternateImageMockup className="lg:left-0">
              {/* Light mode image */}
              <img
                alt="Dashboard mockup showing application interface"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                className="size-full object-contain lg:w-auto lg:max-w-none dark:hidden"
              />
              {/* Dark mode image */}
              <img
                alt="Dashboard mockup showing application interface"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                className="size-full object-contain hidden dark:block lg:w-auto lg:max-w-none"
              />
            </AlternateImageMockup>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 lg:gap-24">
          <div className="max-w-xl flex-1 self-center lg:order-last">
            <FeaturedIcon icon={Zap} size="lg" color="brand" theme="light" />
            <h2 className="mt-5 text-2xl font-semibold text-gray-900 dark:text-gray-100 md:text-3xl">
              Deliver instant answers
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:mt-4 md:text-lg">
              An all-in-one customer service platform that helps you balance everything your customers need to be happy.
            </p>
            <ul className="mt-8 flex flex-col gap-4 pl-2 md:gap-5 md:pl-4">
              {[
                "Keep your customers in the loop with live chat",
                "Embed help articles right on your website",
                "Customers never have to leave the page to find an answer",
              ].map((feat) => (
                <CheckItemText key={feat} size="md" iconStyle="outlined" color="primary" text={feat} />
              ))}
            </ul>
          </div>
          <div className="relative w-full flex-1 lg:h-[512px]">
            <AlternateImageMockup className="lg:right-0">
              {/* Light mode image */}
              <img
                alt="Dashboard mockup showing application interface"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                className="size-full object-contain lg:w-auto lg:max-w-none dark:hidden"
              />
              {/* Dark mode image */}
              <img
                alt="Dashboard mockup showing application interface"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                className="size-full object-contain hidden dark:block lg:w-auto lg:max-w-none"
              />
            </AlternateImageMockup>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 lg:gap-24">
          <div className="max-w-xl flex-1 self-center">
            <FeaturedIcon icon={BarChart3} size="lg" color="brand" theme="light" />
            <h2 className="mt-5 text-2xl font-semibold text-gray-900 dark:text-gray-100 md:text-3xl">
              Manage your team with reports
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:mt-4 md:text-lg">
              Measure what matters with Domio&apos;s easy-to-use reports. You can filter, export, and drilldown on the data in a couple clicks.
            </p>
            <ul className="mt-8 flex flex-col gap-4 pl-2 md:gap-5 md:pl-4">
              {[
                "Filter, export, and drilldown on the data quickly",
                "Save, schedule, and automate reports to your inbox",
                "Connect the tools you already use with 100+ integrations",
              ].map((feat) => (
                <CheckItemText key={feat} size="md" iconStyle="outlined" color="primary" text={feat} />
              ))}
            </ul>
          </div>
          <div className="relative w-full flex-1 lg:h-[512px]">
            <AlternateImageMockup className="lg:left-0">
              {/* Light mode image */}
              <img
                alt="Dashboard mockup showing application interface"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-light-01.webp"
                className="size-full object-contain lg:w-auto lg:max-w-none dark:hidden"
              />
              {/* Dark mode image */}
              <img
                alt="Dashboard mockup showing application interface"
                src="https://www.untitledui.com/marketing/screen-mockups/dashboard-desktop-mockup-dark-01.webp"
                className="size-full object-contain hidden dark:block lg:w-auto lg:max-w-none"
              />
            </AlternateImageMockup>
          </div>
        </div>
      </div>
    </section>
  );
};




