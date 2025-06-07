import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CheckInData {
  mood: string;
  moodLabel: string;
  moodCauses: string[];
  moodIntensity: number;
  notes: string;
  companions: string[];
  location: string;
  customLocationDetails?: string;
}

interface CheckInContextType {
  checkInData: CheckInData;
  updateCheckInData: (data: Partial<CheckInData>) => void;
  resetCheckInData: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

const defaultCheckInData: CheckInData = {
  mood: '',
  moodLabel: '',
  moodCauses: [],
  moodIntensity: 5,
  notes: '',
  companions: [],
  location: '',
  customLocationDetails: '',
};

const CheckInContext = createContext<CheckInContextType | undefined>(undefined);

export function CheckInProvider({ children }: { children: ReactNode }) {
  const [checkInData, setCheckInData] = useState<CheckInData>(defaultCheckInData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCheckInData = (data: Partial<CheckInData>) => {
    setCheckInData(prev => ({ ...prev, ...data }));
  };

  const resetCheckInData = () => {
    setCheckInData(defaultCheckInData);
  };

  return (
    <CheckInContext.Provider
      value={{
        checkInData,
        updateCheckInData,
        resetCheckInData,
        isSubmitting,
        setIsSubmitting,
      }}
    >
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIn() {
  const context = useContext(CheckInContext);
  if (context === undefined) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
}