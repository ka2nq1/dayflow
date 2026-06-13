export type DailyTask = {
  id: string;
  title: string;
  activeDate: string;
  completed: boolean;
  createdAt: string;
};

export type LongTermTask = {
  id: string;
  title: string;
  createdAt: string;
};

export type Step = {
  id: string;
  longTermTaskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
};
