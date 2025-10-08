const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export const saveInvoiceToDatabase = async (invoiceData) => {
  try {
    const response = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...invoiceData,
        createdAt: new Date()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save invoice');
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error saving invoice:', error);

    // Fallback: save to localStorage if API fails
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const newInvoice = {
      ...invoiceData,
      _id: Date.now().toString(),
      createdAt: new Date()
    };
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    return newInvoice._id;
  }
};

export const getInvoices = async () => {
  try {
    const response = await fetch(`${API_BASE}/invoices`);

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching invoices:', error);

    // Fallback: get from localStorage if API fails
    return JSON.parse(localStorage.getItem('invoices') || '[]');
  }
};
