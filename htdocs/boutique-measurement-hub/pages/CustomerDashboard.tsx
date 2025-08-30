import React, { useState } from 'react';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { 
  getCustomerByPhoneFromBackend, 
  createCustomerInBackend, 
  updateCustomerInBackend, 
  createOrderInBackend,
  uploadImageToBackend
} from '../services/backendApi';
import { useAuth } from '../hooks/useAuth';
import type { CustomerData, Measurements, BlouseDetails, ImageInfo } from '../types';
import { OrderStatus } from '../types';
import ImageUpload from '../components/ImageUpload';

const initialMeasurements: Measurements = {
  fullShoulder: '', shoulderWidth: '', backLength: '', backNeckLength: '',
  armholeLooseLeft: '', armholeLooseRight: '', handLength: '', 
  handLooseAboveElbowLeft: '', handLooseAboveElbowRight: '', 
  handLooseBelowElbowLeft: '', handLooseBelowElbowRight: '',
  frontLength: '', frontNeckLength: '', apexLength: '', apexToApex: '',
  chestLoose: '', upperChestLoose: '', waistLoose: '', lehengaLength: '', waistLength: '',
};

const blouseDetailsInitial: BlouseDetails = {
  opening: '',
  doris: '',
  cut: '',
  fastener: '',
  padding: '',
  piping: '',
    };

const imageInitial: ImageInfo = { url: '', notes: '' };

const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
  const [step, setStep] = useState<'search' | 'form' | 'orderCreated'>('search');
  const [searchPhone, setSearchPhone] = useState('');
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [measurements, setMeasurements] = useState<Measurements>(initialMeasurements);
  const [blouseDetails, setBlouseDetails] = useState<BlouseDetails>(blouseDetailsInitial);
  const [images, setImages] = useState<{
    saree: ImageInfo;
    blouseFront: ImageInfo;
    blouseBack: ImageInfo;
    blouseHand: ImageInfo;
  }>({
    saree: { ...imageInitial },
    blouseFront: { ...imageInitial },
    blouseBack: { ...imageInitial },
    blouseHand: { ...imageInitial },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const found = await getCustomerByPhoneFromBackend(searchPhone);
      if (found) {
        setCustomer(found);
        setName(found.name);
        setAddress(found.address || '');
        setDueDate(found.dueDate || '');
        setMeasurements(found.measurements);
        setBlouseDetails(found.blouseDetails);
        setImages(found.images);
        setStep('form');
      } else {
        setCustomer(null);
        setName('');
        setAddress('');
        setDueDate('');
        setMeasurements(initialMeasurements);
        setBlouseDetails(blouseDetailsInitial);
        setImages({
          saree: { ...imageInitial },
          blouseFront: { ...imageInitial },
          blouseBack: { ...imageInitial },
          blouseHand: { ...imageInitial },
        });
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search for customer');
    } finally {
      setLoading(false);
    }
  };

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
    setMeasurements(prev => ({ ...prev, [name]: value }));
    };

  const handleBlouseDetailsChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
    setBlouseDetails(prev => ({ ...prev, [name]: value }));
    };
    
  const handleImageChange = async (key: keyof typeof images, file: File) => {
    try {
      setLoading(true);
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setImages(prev => ({ ...prev, [key]: { ...prev[key], url: tempUrl } }));
      
      // If we have a customer ID, upload the image to the backend
      if (customer?.id) {
        const result = await uploadImageToBackend(file, customer.id, key);
        // Update with the real URL from the server
        setImages(prev => ({ ...prev, [key]: { ...prev[key], url: result.url } }));
      }
      // If no customer ID yet, we'll upload the images after customer creation
    } catch (err: any) {
      setError(`Failed to upload image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleImageNotesChange = (key: keyof typeof images, notes: string) => {
    setImages(prev => ({ ...prev, [key]: { ...prev[key], notes } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    setLoading(true);
    try {
      let customerData;
      if (customer) {
        // Update existing customer
        customerData = await updateCustomerInBackend(customer.id, {
          name,
          phone: searchPhone,
          address,
          dueDate,
          measurements: {
            fullShoulder: measurements.fullShoulder,
            shoulderWidth: measurements.shoulderWidth,
            backLength: measurements.backLength,
            backNeckLength: measurements.backNeckLength,
            armholeLooseLeft: measurements.armholeLooseLeft,
            armholeLooseRight: measurements.armholeLooseRight,
            handLength: measurements.handLength,
            handLooseAboveElbowLeft: measurements.handLooseAboveElbowLeft,
            handLooseAboveElbowRight: measurements.handLooseAboveElbowRight,
            handLooseBelowElbowLeft: measurements.handLooseBelowElbowLeft,
            handLooseBelowElbowRight: measurements.handLooseBelowElbowRight,
            frontLength: measurements.frontLength,
            frontNeckLength: measurements.frontNeckLength,
            apexLength: measurements.apexLength,
            apexToApex: measurements.apexToApex,
            chestLoose: measurements.chestLoose,
            upperChestLoose: measurements.upperChestLoose,
            waistLoose: measurements.waistLoose,
            lehengaLength: measurements.lehengaLength,
            waistLength: measurements.waistLength,
          },
          blouseDetails,
          images,
          orderStatus: customer.orderStatus || OrderStatus.PENDING,
        });
        
        // Upload any new images that were added
        await uploadPendingImages(customerData.id);
      } else {
        // Create new customer
        customerData = await createCustomerInBackend({
          id: `CUST-${Date.now()}`,
          name,
          phone: searchPhone,
          address,
          dueDate,
          measurements: {
            fullShoulder: measurements.fullShoulder,
            shoulderWidth: measurements.shoulderWidth,
            backLength: measurements.backLength,
            backNeckLength: measurements.backNeckLength,
            armholeLooseLeft: measurements.armholeLooseLeft,
            armholeLooseRight: measurements.armholeLooseRight,
            handLength: measurements.handLength,
            handLooseAboveElbowLeft: measurements.handLooseAboveElbowLeft,
            handLooseAboveElbowRight: measurements.handLooseAboveElbowRight,
            handLooseBelowElbowLeft: measurements.handLooseBelowElbowLeft,
            handLooseBelowElbowRight: measurements.handLooseBelowElbowRight,
            frontLength: measurements.frontLength,
            frontNeckLength: measurements.frontNeckLength,
            apexLength: measurements.apexLength,
            apexToApex: measurements.apexToApex,
            chestLoose: measurements.chestLoose,
            upperChestLoose: measurements.upperChestLoose,
            waistLoose: measurements.waistLoose,
            lehengaLength: measurements.lehengaLength,
            waistLength: measurements.waistLength,
          },
          blouseDetails,
          images: {
            saree: { url: '', notes: images.saree.notes },
            blouseFront: { url: '', notes: images.blouseFront.notes },
            blouseBack: { url: '', notes: images.blouseBack.notes },
            blouseHand: { url: '', notes: images.blouseHand.notes },
          },
          orderStatus: OrderStatus.PENDING,
        });
        
        // Upload all images for the new customer
        await uploadPendingImages(customerData.id);
      }
      
      // Create a new order for the customer
      const orderData = await createOrderInBackend(customerData.id);
      
      setOrderId(orderData.id);
      setOrderDate(orderData.createdAt);
      setStep('orderCreated');
    } catch (err: any) {
      setError(err.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to upload any pending images
  const uploadPendingImages = async (customerId: string) => {
    // For each image type, check if it's a blob URL (locally created) and upload if needed
    for (const key of ['saree', 'blouseFront', 'blouseBack', 'blouseHand'] as const) {
      const imageInfo = images[key];
      if (imageInfo.url && imageInfo.url.startsWith('blob:')) {
        try {
          // Convert blob URL back to File object
          const response = await fetch(imageInfo.url);
          const blob = await response.blob();
          const file = new File([blob], `${key}.jpg`, { type: 'image/jpeg' });
          
          // Upload to backend
          const result = await uploadImageToBackend(file, customerId, key);
          
          // Update state with the real URL
          setImages(prev => ({ ...prev, [key]: { ...prev[key], url: result.url } }));
        } catch (err) {
          console.error(`Failed to upload ${key} image:`, err);
        }
      }
    }
  };

    return (
    <div className="bg-neutral-100 min-h-screen">
      <Header />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {step === 'search' && (
          <form onSubmit={handleSearch} className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg space-y-6 mt-10">
            <h2 className="text-xl font-bold text-center">Customer Mobile Number Search</h2>
            <Input
              id="searchPhone"
              label="Customer Mobile Number"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              required
            />
            <Button type="submit" isLoading={loading} size="lg" className="w-full">Search</Button>
          </form>
        )}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-8 mt-10">
            <div className="flex flex-row gap-8">
              {/* Left: Avatar and Details */}
              <div className="flex flex-col items-center w-1/4 min-w-[200px]">
                <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center text-4xl mb-4">
                  <span role="img" aria-label="avatar">🧑</span>
                </div>
                <div className="font-semibold">{searchPhone || customer?.phone}</div>
                <div className="font-semibold">{name || customer?.name}</div>
                <Input id="name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className="mt-4" />
              </div>
              {/* Middle: Measurements */}
              <div className="flex-1 px-4">
                <h3 className="text-lg font-semibold mb-2">Measurements:</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  <Input label="Full shoulder" name="fullShoulder" value={measurements.fullShoulder} onChange={handleMeasurementChange} />
                  <Input label="Shoulder width" name="shoulderWidth" value={measurements.shoulderWidth} onChange={handleMeasurementChange} />
                  <Input label="Back length" name="backLength" value={measurements.backLength} onChange={handleMeasurementChange} />
                  <Input label="Back neck length" name="backNeckLength" value={measurements.backNeckLength} onChange={handleMeasurementChange} />
                  
                  <div className="col-span-2">
                    <div className="mb-2">Armhole loose</div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Left" name="armholeLooseLeft" value={measurements.armholeLooseLeft} onChange={handleMeasurementChange} />
                      <Input label="Right" name="armholeLooseRight" value={measurements.armholeLooseRight} onChange={handleMeasurementChange} />
                    </div>
                  </div>
                  
                  <Input label="Hand length" name="handLength" value={measurements.handLength} onChange={handleMeasurementChange} />
                  <div className="col-span-1"></div>
                  
                  <div className="col-span-2">
                    <div className="mb-2">Hand loose (above elbow)</div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Left" name="handLooseAboveElbowLeft" value={measurements.handLooseAboveElbowLeft} onChange={handleMeasurementChange} />
                      <Input label="Right" name="handLooseAboveElbowRight" value={measurements.handLooseAboveElbowRight} onChange={handleMeasurementChange} />
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="mb-2">Hand loose (below elbow)</div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Left" name="handLooseBelowElbowLeft" value={measurements.handLooseBelowElbowLeft} onChange={handleMeasurementChange} />
                      <Input label="Right" name="handLooseBelowElbowRight" value={measurements.handLooseBelowElbowRight} onChange={handleMeasurementChange} />
                    </div>
                  </div>
                  
                  <Input label="Front length" name="frontLength" value={measurements.frontLength} onChange={handleMeasurementChange} />
                  <Input label="Front neck length" name="frontNeckLength" value={measurements.frontNeckLength} onChange={handleMeasurementChange} />
                  <Input label="Apex length" name="apexLength" value={measurements.apexLength} onChange={handleMeasurementChange} />
                  <Input label="Apex to apex" name="apexToApex" value={measurements.apexToApex} onChange={handleMeasurementChange} />
                  <Input label="Chest loose" name="chestLoose" value={measurements.chestLoose} onChange={handleMeasurementChange} />
                  <Input label="Upperchest loose" name="upperChestLoose" value={measurements.upperChestLoose} onChange={handleMeasurementChange} />
                  <Input label="Waist loose" name="waistLoose" value={measurements.waistLoose} onChange={handleMeasurementChange} />
                  <Input label="Lehenga length" name="lehengaLength" value={measurements.lehengaLength} onChange={handleMeasurementChange} />
                  <Input label="Waist length" name="waistLength" value={measurements.waistLength} onChange={handleMeasurementChange} />
                  
                  <div className="col-span-2 mt-4 border-t pt-4">
                    <h4 className="text-md font-semibold mb-2">Order Details:</h4>
                  </div>
                  <Input label="Address" id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} />
                  <Input label="Due Date" id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              {/* Right: Images and Blouse Details */}
              <div className="flex flex-col w-1/3 min-w-[300px] gap-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <ImageUpload title="Saree image upload" imageInfo={images.saree} onNotesChange={notes => handleImageNotesChange('saree', notes)} onImageChange={file => handleImageChange('saree', file)} />
                    <textarea className="w-full mt-2 border rounded p-1 text-xs" placeholder="Add notes..." value={images.saree.notes} onChange={e => handleImageNotesChange('saree', e.target.value)} />
                  </div>
                  <div>
                    <ImageUpload title="Blouse front image" imageInfo={images.blouseFront} onNotesChange={notes => handleImageNotesChange('blouseFront', notes)} onImageChange={file => handleImageChange('blouseFront', file)} />
                    <textarea className="w-full mt-2 border rounded p-1 text-xs" placeholder="Add notes..." value={images.blouseFront.notes} onChange={e => handleImageNotesChange('blouseFront', e.target.value)} />
                  </div>
                  <div>
                    <ImageUpload title="Blouse back image" imageInfo={images.blouseBack} onNotesChange={notes => handleImageNotesChange('blouseBack', notes)} onImageChange={file => handleImageChange('blouseBack', file)} />
                    <textarea className="w-full mt-2 border rounded p-1 text-xs" placeholder="Add notes..." value={images.blouseBack.notes} onChange={e => handleImageNotesChange('blouseBack', e.target.value)} />
                  </div>
                  <div>
                    <ImageUpload title="Blouse hand image" imageInfo={images.blouseHand} onNotesChange={notes => handleImageNotesChange('blouseHand', notes)} onImageChange={file => handleImageChange('blouseHand', file)} />
                    <textarea className="w-full mt-2 border rounded p-1 text-xs" placeholder="Add notes..." value={images.blouseHand.notes} onChange={e => handleImageNotesChange('blouseHand', e.target.value)} />
                  </div>
                </div>
                <div className="text-xs text-neutral-500 mb-4">give some space to add text below each image</div>
                <div className="border p-4 rounded bg-neutral-50">
                  <div className="font-semibold mb-2">Blouse Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Front open/Backopen</label>
                      <select name="opening" value={blouseDetails.opening} onChange={handleBlouseDetailsChange} className="w-full border rounded p-1">
                        <option value="">Select...</option>
                        <option value="front">Front open</option>
                        <option value="back">Back open</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Doris</label>
                      <select name="doris" value={blouseDetails.doris} onChange={handleBlouseDetailsChange} className="w-full border rounded p-1">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Cut</label>
                      <select name="cut" value={blouseDetails.cut} onChange={handleBlouseDetailsChange} className="w-full border rounded p-1">
                        <option value="">Select...</option>
                        <option value="princess">Princess cut</option>
                        <option value="3dart">3dart</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Fastener</label>
                      <select name="fastener" value={blouseDetails.fastener} onChange={handleBlouseDetailsChange} className="w-full border rounded p-1">
                        <option value="">Select...</option>
                        <option value="zip">Zip</option>
                        <option value="hooks">Hooks</option>
                      </select>
                </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Padding</label>
                      <select name="padding" value={blouseDetails.padding} onChange={handleBlouseDetailsChange} className="w-full border rounded p-1">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Piping</label>
                      <select name="piping" value={blouseDetails.piping} onChange={handleBlouseDetailsChange} className="w-full border rounded p-1">
                        <option value="">Select...</option>
                        <option value="self">Self</option>
                        <option value="contrast">Contrast</option>
                      </select>
                         </div>
                    </div>
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" isLoading={loading} size="lg" className="w-full mt-4">Save & Create Order</Button>
            </form>
        )}
        {step === 'orderCreated' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6 mt-10 text-center">
            <h2 className="text-2xl font-bold">Order Created!</h2>
            <div className="text-lg">Order ID: <span className="font-mono">{orderId}</span></div>
            <div className="text-lg">Order Date: <span className="font-mono">{orderDate}</span></div>
            <Button onClick={() => { setStep('search'); setSearchPhone(''); setCustomer(null); setName(''); setAddress(''); setDueDate(''); setMeasurements(initialMeasurements); setOrderId(''); setOrderDate(''); setBlouseDetails(blouseDetailsInitial); setImages({ saree: { ...imageInitial }, blouseFront: { ...imageInitial }, blouseBack: { ...imageInitial }, blouseHand: { ...imageInitial } }); }} size="md" className="mt-4">Create Another</Button>
          </div>
        )}
        </main>
        </div>
    );
};

export default CustomerDashboard;