export interface StateInfo {
  state: string;
  code: string;
  districts: string[];
  defaultPincode: string;
}

export const INDIAN_STATES: StateInfo[] = [
  {
    state: 'West Bengal',
    code: 'WB',
    defaultPincode: '722157',
    districts: ['Bankura', 'Kolkata', 'Howrah', 'Hooghly', 'North 24 Parganas', 'South 24 Parganas', 'Paschim Medinipur', 'Purba Medinipur', 'Burdwan', 'Birbhum', 'Purulia', 'Murshidabad', 'Nadia', 'Malda', 'Darjeeling', 'Jalpaiguri', 'Siliguri', 'Cooch Behar']
  },
  {
    state: 'Maharashtra',
    code: 'MH',
    defaultPincode: '400001',
    districts: ['Mumbai', 'Mumbai Suburban', 'Thane', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Palghar', 'Raigad', 'Satara', 'Sangli', 'Amravati', 'Nanded']
  },
  {
    state: 'Delhi',
    code: 'DL',
    defaultPincode: '110001',
    districts: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi']
  },
  {
    state: 'Karnataka',
    code: 'KA',
    defaultPincode: '560001',
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru (Dakshina Kannada)', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Ballari', 'Udupi', 'Tumakuru', 'Shivamogga']
  },
  {
    state: 'Tamil Nadu',
    code: 'TN',
    defaultPincode: '600001',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Thanjavur', 'Kanchipuram', 'Tirunelveli']
  },
  {
    state: 'Uttar Pradesh',
    code: 'UP',
    defaultPincode: '226001',
    districts: ['Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Lucknow', 'Kanpur Nagar', 'Varanasi', 'Agra', 'Prayagraj (Allahabad)', 'Meerut', 'Bareilly', 'Gorakhpur', 'Aligarh', 'Mathura']
  },
  {
    state: 'Gujarat',
    code: 'GJ',
    defaultPincode: '380001',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch', 'Navsari']
  },
  {
    state: 'Telangana',
    code: 'TS',
    defaultPincode: '500001',
    districts: ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar']
  },
  {
    state: 'Kerala',
    code: 'KL',
    defaultPincode: '695001',
    districts: ['Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur', 'Kottayam', 'Alappuzha', 'Malappuram']
  },
  {
    state: 'Rajasthan',
    code: 'RJ',
    defaultPincode: '302001',
    districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Chittorgarh']
  },
  {
    state: 'Bihar',
    code: 'BR',
    defaultPincode: '800001',
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Begusarai', 'Rohtas', 'Nalanda']
  },
  {
    state: 'Punjab',
    code: 'PB',
    defaultPincode: '141001',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali (SAS Nagar)', 'Bathinda', 'Pathankot']
  },
  {
    state: 'Haryana',
    code: 'HR',
    defaultPincode: '122001',
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Panchkula']
  },
  {
    state: 'Odisha',
    code: 'OR',
    defaultPincode: '751001',
    districts: ['Bhubaneswar (Khurda)', 'Cuttack', 'Rourkela (Sundargarh)', 'Puri', 'Sambalpur', 'Balasore', 'Brahmapur']
  },
  {
    state: 'Assam',
    code: 'AS',
    defaultPincode: '781001',
    districts: ['Kamrup Metropolitan (Guwahati)', 'Dibrugarh', 'Silchar (Cachar)', 'Jorhat', 'Nagaon', 'Tinsukia']
  },
  {
    state: 'Jharkhand',
    code: 'JH',
    defaultPincode: '834001',
    districts: ['Ranchi', 'Jamshedpur (East Singhbhum)', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar']
  },
  {
    state: 'Chhattisgarh',
    code: 'CG',
    defaultPincode: '492001',
    districts: ['Raipur', 'Bhilai (Durg)', 'Bilaspur', 'Korba', 'Rajnandgaon']
  },
  {
    state: 'Madhya Pradesh',
    code: 'MP',
    defaultPincode: '462001',
    districts: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Satna']
  },
  {
    state: 'Andhra Pradesh',
    code: 'AP',
    defaultPincode: '530001',
    districts: ['Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Nellore', 'Kakinada', 'Kurnool']
  },
  {
    state: 'Uttarakhand',
    code: 'UK',
    defaultPincode: '248001',
    districts: ['Dehradun', 'Haridwar', 'Nainital (Haldwani)', 'Udham Singh Nagar', 'Roorkee']
  },
  {
    state: 'Himachal Pradesh',
    code: 'HP',
    defaultPincode: '171001',
    districts: ['Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan', 'Kullu']
  },
  {
    state: 'Goa',
    code: 'GA',
    defaultPincode: '403001',
    districts: ['North Goa (Panaji)', 'South Goa (Margao)']
  },
  {
    state: 'Jammu and Kashmir',
    code: 'JK',
    defaultPincode: '190001',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur']
  }
];

// Helper to auto-lookup State & District by Pincode Prefix
export function lookupPincode(pincode: string): { state: string; district: string } | null {
  if (!pincode || pincode.length < 2) return null;
  const p = pincode.trim();

  // West Bengal (70 - 74)
  if (p.startsWith('70') || p.startsWith('71') || p.startsWith('72') || p.startsWith('73') || p.startsWith('74')) {
    if (p.startsWith('722')) return { state: 'West Bengal', district: 'Bankura' };
    if (p.startsWith('700')) return { state: 'West Bengal', district: 'Kolkata' };
    if (p.startsWith('711')) return { state: 'West Bengal', district: 'Howrah' };
    if (p.startsWith('734')) return { state: 'West Bengal', district: 'Siliguri' };
    return { state: 'West Bengal', district: 'Kolkata' };
  }
  // Maharashtra (40 - 44)
  if (p.startsWith('40') || p.startsWith('41') || p.startsWith('42') || p.startsWith('43') || p.startsWith('44')) {
    if (p.startsWith('400')) return { state: 'Maharashtra', district: 'Mumbai' };
    if (p.startsWith('411')) return { state: 'Maharashtra', district: 'Pune' };
    return { state: 'Maharashtra', district: 'Mumbai' };
  }
  // Delhi (11)
  if (p.startsWith('11')) return { state: 'Delhi', district: 'New Delhi' };
  // Karnataka (56 - 59)
  if (p.startsWith('56') || p.startsWith('57') || p.startsWith('58') || p.startsWith('59')) {
    if (p.startsWith('560')) return { state: 'Karnataka', district: 'Bengaluru Urban' };
    return { state: 'Karnataka', district: 'Bengaluru Urban' };
  }
  // Tamil Nadu (60 - 64)
  if (p.startsWith('60') || p.startsWith('61') || p.startsWith('62') || p.startsWith('63') || p.startsWith('64')) {
    if (p.startsWith('600')) return { state: 'Tamil Nadu', district: 'Chennai' };
    return { state: 'Tamil Nadu', district: 'Chennai' };
  }
  // Uttar Pradesh (20 - 28)
  if (p.startsWith('20') || p.startsWith('21') || p.startsWith('22') || p.startsWith('23') || p.startsWith('24') || p.startsWith('25') || p.startsWith('26') || p.startsWith('27') || p.startsWith('28')) {
    if (p.startsWith('201')) return { state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar (Noida)' };
    if (p.startsWith('226')) return { state: 'Uttar Pradesh', district: 'Lucknow' };
    return { state: 'Uttar Pradesh', district: 'Lucknow' };
  }
  // Gujarat (36 - 39)
  if (p.startsWith('36') || p.startsWith('37') || p.startsWith('38') || p.startsWith('39')) {
    if (p.startsWith('380')) return { state: 'Gujarat', district: 'Ahmedabad' };
    return { state: 'Gujarat', district: 'Ahmedabad' };
  }

  return null;
}
