import { createContext, useContext, useState, ReactNode } from 'react';

interface ApiContextType {
  menuItemsFetched: boolean;
  ordersFetched: boolean;
  reservationsFetched: boolean;
  setMenuItemsFetched: (fetched: boolean) => void;
  setOrdersFetched: (fetched: boolean) => void;
  setReservationsFetched: (fetched: boolean) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}

export function ApiProvider({ children }: { children: ReactNode }) {
  const [menuItemsFetched, setMenuItemsFetched] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [reservationsFetched, setReservationsFetched] = useState(false);

  return (
    <ApiContext.Provider value={{
      menuItemsFetched,
      ordersFetched,
      reservationsFetched,
      setMenuItemsFetched,
      setOrdersFetched,
      setReservationsFetched
    }}>
      {children}
    </ApiContext.Provider>
  );
}
