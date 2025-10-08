import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Eye, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import  bookingAPI  from '../api/bookingAPI';
import AgreementPreview from './AgreementPreview';
import { enqueueSnackbar } from 'notistack';
import { apiUrl } from "./LoginSignup";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const BookingAgreementGenerator = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [agreementHtml, setAgreementHtml] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [error, setError] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [downloadHistory, setDownloadHistory] = useState([]);

    // Load bookings from backend
    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
  try {
    setIsLoadingBookings(true);

    // Get userSession from localStorage
    const userSession = JSON.parse(localStorage.getItem("userSession"));
    if (!userSession || !userSession.token) {
      throw new Error('User is not authenticated. Please log in.');
    }

    // Log for debugging
    console.log('Requesting all bookings with token:', userSession.token);

    // API request with authorization token
    const response = await fetch(`${API_BASE_URL}/booking/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${userSession.token}`,  // Use token from userSession
      },
    });

    // Log the response status
    console.log('Response status:', response);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched bookings:', data);

    // Handle data
    if (data && Array.isArray(data.Allbookings)) {
      setBookings(data.Allbookings);
      setError(null);
    } else {
      throw new Error('Invalid response format. Expected an array of bookings.');
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    setError(`Failed to load bookings. Please try again. ${error.message}`);
  } finally {
    setIsLoadingBookings(false);
  }
};



    const handleBookingSelect = async (booking) => {
        try {
            setIsLoading(true);
            setError(null);
            setSelectedBooking(booking);

            // Fetch agreement HTML from backend
            const response = await bookingAPI.generateAgreement(booking._id); // Generate agreement from backend
            setAgreementHtml(response.data.agreementHtml);
            setShowPreview(true);
        } catch (err) {
            setError('Failed to generate agreement preview. Please try again.');
            console.error('Error generating agreement:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!selectedBooking || !agreementHtml) return;

        try {
            setIsLoading(true);
            await generatePDF(agreementHtml, `Booking-Agreement-${selectedBooking._id}`);

            // Add to download history
            const downloadEntry = {
                bookingId: selectedBooking._id,
                companyName: selectedBooking.company_name,
                downloadedAt: new Date().toISOString(),
            };
            setDownloadHistory(prev => [downloadEntry, ...prev]);

            setError(null);
        } catch (err) {
            setError('Failed to generate PDF. Please try again.');
            console.error('Error generating PDF:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const search = searchTerm.toLowerCase().trim();

        const checkIfMatches = (field) => field && field.toLowerCase().includes(search);

        return (
            checkIfMatches(booking.company_name) ||
            checkIfMatches(booking.contact_person) ||
            checkIfMatches(booking.email) ||
            checkIfMatches(booking.contact_no) ||
            checkIfMatches(booking.bdm) ||
            checkIfMatches(booking.branch_name) ||
            checkIfMatches(booking.state) ||
            checkIfMatches(booking.status) ||
            checkIfMatches(booking.pan) ||
            checkIfMatches(booking.gst) ||
            (booking.services && booking.services.some(service => checkIfMatches(service)))
        );
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Agreement Generator</h1>
                    <p className="text-gray-600">Select a booking to generate and download agreement PDFs</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Booking List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings</h2>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by company, contact, email, phone, BDM..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {isLoadingBookings ? (
                                    <div className="p-6 flex items-center justify-center">
                                        <Loader className="h-6 w-6 animate-spin text-blue-500" />
                                        <span className="ml-2 text-gray-600">Loading bookings...</span>
                                    </div>
                                ) : filteredBookings.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        {searchTerm ? 'No bookings match your search.' : 'No bookings found.'}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredBookings.map((booking) => (
                                            <div
                                                key={booking._id}
                                                onClick={() => handleBookingSelect(booking)}
                                                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${selectedBooking?._id === booking._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                                            {booking.company_name || 'No Company Name'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 truncate">{booking.contact_person}</p>
                                                        <p className="text-xs text-gray-500 truncate">{booking.email}</p>
                                                        <p className="text-xs text-gray-500">Phone: {booking.contact_no}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            BDM: {booking.bdm} • {formatCurrency(booking.total_amount)}
                                                        </p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : booking.status === 'Completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : booking.status === 'In Progress'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {booking.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Agreement Preview and Details */}
                    <div className="lg:col-span-2">
                        {!selectedBooking ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Booking</h3>
                                    <p className="text-gray-600">Choose a booking from the list to generate an agreement preview</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Booking Details */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowPreview(true)}
                                                disabled={isLoading}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Preview
                                            </button>
                                            <button
                                                onClick={handleDownloadPDF}
                                                disabled={isLoading || !agreementHtml}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isLoading ? (
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Company Name</label>
                                                <p className="text-gray-900">{selectedBooking.company_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Contact Person</label>
                                                <p className="text-gray-900">{selectedBooking.contact_person}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Email</label>
                                                <p className="text-gray-900">{selectedBooking.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Contact Number</label>
                                                <p className="text-gray-900">{selectedBooking.contact_no}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Services</label>
                                                <p className="text-gray-900">{selectedBooking.services?.join(', ') || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">BDM</label>
                                                <p className="text-gray-900">{selectedBooking.bdm}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Branch</label>
                                                <p className="text-gray-900">{selectedBooking.branch_name}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Total Amount</label>
                                                <p className="text-gray-900 text-lg font-semibold">{formatCurrency(selectedBooking.total_amount)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Payment Date</label>
                                                <p className="text-gray-900">{selectedBooking.payment_date ? formatDate(selectedBooking.payment_date) : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">State</label>
                                                <p className="text-gray-900">{selectedBooking.state}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Agreement Preview Modal */}
                                {showPreview && (
                                    <AgreementPreview
                                        agreementHtml={agreementHtml}
                                        isLoading={isLoading}
                                        onClose={() => setShowPreview(false)}
                                        onDownload={handleDownloadPDF}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Download History */}
                {downloadHistory.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Download History</h2>
                        <div className="space-y-2">
                            {downloadHistory.slice(0, 5).map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{entry.companyName}</p>
                                            <p className="text-xs text-gray-600">Booking ID: {entry.bookingId}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {new Date(entry.downloadedAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingAgreementGenerator;
