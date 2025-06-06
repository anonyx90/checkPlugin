export type CheckResult = {
  id: string;
  title: string;
  status: "pass" | "fail" | "warning";
  details?: string[];
};

export type Check = {
  id: string;
  title: string;
  run: () => Promise<CheckResult>;
  category?: string;  
};
