
import { BonLivraison } from "../Article/Interfaces";

const API_URL = "http://54.37.159.225:5000/api";


// Fetch all client orders
export const FetchBonLivraison = async (): Promise<BonLivraison[]> => {
    debugger
    try {
        const response = await fetch(`${API_URL}/bons-livraison/getbonlivraison`);
        if (!response.ok) {
            throw new Error('Failed to fetch client orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching client orders:', error);
        throw error;
    }
};

// Create a new client order
export const createBonLivraison = async (bonLivraison: Omit<BonLivraison, 'id'>): Promise<BonLivraison> => {
    try {
        const response = await fetch(`${API_URL}/bons-livraison/addbonlivraison`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bonLivraison),
        });
        if (!response.ok) {
            throw new Error('Failed to create delivery note');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating delivery note:', error);
        throw error;
    }
};
// Update a client order
export const updateBonLivraison = async (id: number, bonCommande: Partial<BonLivraison>): Promise<BonLivraison> => {
   debugger
    try {
        const response = await fetch(`${API_URL}/bons-livraison/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bonCommande),
        });
        if (!response.ok) {
            throw new Error('Failed to update client order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating client order:', error);
        throw error;
    }
};

// Delete a client order
export const deleteBonLivraison = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/bons-livraison/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete client order');
        }
    } catch (error) {
        console.error('Error deleting client order:', error);
        throw error;
    }
};


export const fetchNextLivraisonNumber = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/bons-livraison/getNextLivraisonNumber`);
    if (!response.ok) throw new Error("Failed to fetch next livraison number");
    const data = await response.json();
    return data.numeroLivraison;
};



