export type PlanId = "free" | "basic" | "pro" | "extreme";

export type Car = {
  id: string;
  name: string;
  color: string;
  details: string;
  specialty: string;
  benefits: string;
  image: string;
};

export type Character = {
  id: string;
  name: string;
  gender: "male" | "female";
  details: string;
};

export type Outfit = {
  id: string;
  name: string;
  details: string;
};

export type Phase = {
  id: number;
  name: string;
  description: string;
};

export type DailyTask = {
  id: string;
  title: string;
  description: string;
  type: "challenge" | "objective" | "mission";
};
