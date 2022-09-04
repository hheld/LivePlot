import create from "zustand/vanilla";

interface AvailableQuantitiesState {
    availableQuantities: string[]
}

export const availableQuantitiesStore = create<AvailableQuantitiesState>(() => ({
    availableQuantities: []
}));

export const availableQuantities = () => availableQuantitiesStore.getState().availableQuantities;

export const storeAvailableQuantity = (quantity: string) =>
    availableQuantitiesStore.setState((state) => ({availableQuantities: [...state.availableQuantities, quantity]}));
