/** /src/providers/StoreProvider.tsx
 * React-Redux Provider wrapper.
 */
import { Provider } from "react-redux";
import { store } from "@/store/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}