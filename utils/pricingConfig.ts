import pricingTest from "../config/pricing_test.json";
import pricingProduction from "../config/pricing_production.json";

type PricingFeaturePlan = {
  key: string;
  name_zh: string;
  name_en: string;
  label_zh: string;
  label_en: string;
  price_usd: number;
  credits: number;
  highlight: boolean;
  creem_product_id: string;
  features_zh: string[];
  features_en: string[];
};

type PricingConfig = {
  plans: PricingFeaturePlan[];
};

const isProduction = process.env.NODE_ENV === "production";

export const pricingConfig: PricingConfig =
  (isProduction ? pricingProduction : pricingTest) as PricingConfig;
