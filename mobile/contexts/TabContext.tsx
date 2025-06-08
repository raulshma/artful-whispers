import React, { createContext, useContext, useState, ReactNode } from "react";

interface TabContextType {
  activeTabIndex: number;
  setActiveTabIndex: (index: number) => void;
  totalTabs: number;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const totalTabs = 4; // journal, stats, checkin, profile

  return (
    <TabContext.Provider
      value={{
        activeTabIndex,
        setActiveTabIndex,
        totalTabs,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}

export function useTabContext() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTabContext must be used within a TabProvider");
  }
  return context;
}
