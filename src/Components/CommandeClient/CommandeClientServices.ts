import { BonCommandeClient } from "../Article/Interfaces";

const API_URL = "http://54.37.159.225:5000/api";


// *************************************** BON COMMANDE CLIENT
export const fetchBonsCommandeClient = async (): Promise<BonCommandeClient[]> => {
    debugger
    try {
        const response = await fetch(`${API_URL}/bons-commande-client/getAllBonCommandeClient`);
        if (!response.ok) {
            throw new Error('Failed to fetch client orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching client orders:', error);
        throw error;
    }
};

export const fetchNextCommandeNumber = async (): Promise<string> => {
    
    const response = await fetch(`${API_URL}/bons-commande-client/getnumbercommande`);
    if (!response.ok) throw new Error("Failed to fetch next commande number");
    const data = await response.json();
    return data.numeroCommande;
};

export const createBonCommandeClient = async (bonCommande: Omit<BonCommandeClient, 'id'>): Promise<BonCommandeClient> => {
    
    try {
        const response = await fetch(`${API_URL}/bons-commande-client/addBonCommandeClient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bonCommande),
        });
        console.log(bonCommande)
        if (!response.ok) {
            throw new Error('Failed to create client order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating client order:', error);
        throw error;
    }
};

export const createBonCommandeClientBasedOnDevis = async (bonCommande: Omit<BonCommandeClient, 'id'>): Promise<BonCommandeClient> => {
    
    try {
        const response = await fetch(`${API_URL}/bons-commande-client/createBonCommandeClientBasedOnDevis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bonCommande),
        });
        console.log(bonCommande)
        if (!response.ok) {
            throw new Error('Failed to create client order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating client order:', error);
        throw error;
    }
};

export const updateBonCommandeClient = async (id: number, bonCommande: Partial<BonCommandeClient>): Promise<BonCommandeClient> => {
   
    try {
        const response = await fetch(`${API_URL}/bons-commande-client/${id}`, {
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

export const deleteBonCommandeClient = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/bons-commande-client/${id}`, {
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


// *************************************** BON COMMANDE CLIENT


export const createDevis = async (bonCommande: Omit<BonCommandeClient, 'id'>): Promise<BonCommandeClient> => {
    
    try {
        const response = await fetch(`${API_URL}/devis/addBonCommandeClient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bonCommande),
        });
        if (!response.ok) {
            throw new Error('Failed to create client order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating client order:', error);
        throw error;
    }
};


export const deleteDevis = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/devis/deleteDevisClient/${id}`, {
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

export const fetchDevis = async (): Promise<BonCommandeClient[]> => {
    
    try {
        const response = await fetch(`${API_URL}/devis/getAllBonCommandeClient`);
        if (!response.ok) {
            throw new Error('Failed to fetch client orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching client orders:', error);
        throw error;
    }
};

export const updateDevis = async (id: number, bonCommande: Partial<BonCommandeClient>): Promise<BonCommandeClient> => {
    debugger
     try {
         const response = await fetch(`${API_URL}/devis/${id}`, {
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










//************************************************ fetchVenteComptoire

export const fetchVenteComptoire = async (): Promise<BonCommandeClient[]> => {
    try {
        const response = await fetch(`${API_URL}/VenteComptoire/getAllVenteComptoire`);
        if (!response.ok) {
            throw new Error('Failed to fetch client orders');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching client orders:', error);
        throw error;
    }
};


export const CreateVenteComptoire = async (bonCommande: Omit<BonCommandeClient, 'id'>): Promise<BonCommandeClient> => {
    try {
        debugger
        const response = await fetch(`${API_URL}/VenteComptoire/addVenteComptoire`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bonCommande),
        });
        if (!response.ok) {
            throw new Error('Failed to create client order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating client order:', error);
        throw error;
    }
};


export const updateventecomptoire = async (id: number, bonCommande: Partial<BonCommandeClient>): Promise<BonCommandeClient> => {
    try {
        const response = await fetch(`${API_URL}/VenteComptoire/updateventecomptoire/${id}`, {
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


export const deleteventecomptoire = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/VenteComptoire/deleteventecomptoire/${id}`, {
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






export const fetchNextVenteComptoireNumber = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/VenteComptoire/fetchNextVenteComptoireNumber`);
    if (!response.ok) throw new Error("Failed to fetch next commande number");
    const data = await response.json();
    return data.numeroCommande;
};

