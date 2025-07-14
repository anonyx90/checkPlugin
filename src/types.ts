export type CheckResult = {
  id: string;
  title: string;
  status: "pass" | "fail" | "warning";
  details?: Array<string | JSX.Element>;
};

export type Check = {
  id: string;
  title: string;
  run: () => Promise<CheckResult>;
  category?: string;  
};
