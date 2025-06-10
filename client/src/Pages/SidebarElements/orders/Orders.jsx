import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Label, TextInput, Select, Checkbox } from 'flowbite-react';

const CreateOrderForm = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    location: '',
    productname: '',
    producttype: '',
    holdingstatus: '',
    quantity: 1,
    withShipping: false,
    destination: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/price/getallprices');
        const data = await res.json();
          console.log('Fetched prices:', data);  // <-- Add thi
        setPrices(data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Get unique values helper
  const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]))].filter(Boolean);

  // Filtered list based on form selections
  const filteredPrices = prices.filter((p) => {
    return (
      (!form.location || p.salesLocation === form.location) &&
      (!form.productname || p.productName === form.productname) &&
      (!form.producttype || p.productType === form.producttype) &&
      (!form.holdingstatus || String(p.withHolding) === form.holdingstatus)
    );
  });

  // Dropdown values
  const uniqueLocations = getUnique(prices, 'salesLocation');
  const productNames = getUnique(
    prices.filter(p => p.salesLocation === form.location),
    'productName'
  );
  const productTypes = getUnique(
    prices.filter(p =>
      p.salesLocation === form.location &&
      p.productName === form.productname
    ),
    'productType'
  );
  const holdingStatuses = getUnique(
    prices.filter(p =>
      p.salesLocation === form.location &&
      p.productName === form.productname &&
      p.productType === form.producttype
    ),
    'withHolding'
  );

  // Total price calculation
  useEffect(() => {
    const matchedPrice = prices.find((price) =>
      price.salesLocation === form.location &&
      price.productName === form.productname &&
      price.productType === form.producttype &&
      String(price.withHolding) === form.holdingstatus
    );

    if (matchedPrice) {
      setTotalPrice(matchedPrice.pricePerUnit * form.quantity);
    } else {
      setTotalPrice(0);
    }
  }, [form, prices]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Card>
        <h2 className="text-xl font-semibold mb-6">Create New Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sales Location */}
          <div>
            <Label>Product Location</Label>
            <Select name="location" value={form.location} onChange={handleChange}>
              <option value="">Select location</option>
              {uniqueLocations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </Select>
          </div>

          {/* Product Name */}
          <div>
            <Label>Product Name</Label>
            <Select name="productname" value={form.productname} onChange={handleChange}>
              <option value="">Select product</option>
              {productNames.map((name, i) => (
                <option key={i} value={name}>{name}</option>
              ))}
            </Select>
          </div>

          {/* Product Type */}
          <div>
            <Label>Product Type</Label>
            <Select name="producttype" value={form.producttype} onChange={handleChange}>
              <option value="">Select type</option>
              {productTypes.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </Select>
          </div>

          {/* Holding Status */}
          <div>
            <Label>Holding Status</Label>
            <Select name="holdingstatus" value={form.holdingstatus} onChange={handleChange}>
              <option value="">Select status</option>
              {holdingStatuses.map((status, i) => (
                <option key={i} value={String(status)}>{String(status)}</option>
              ))}
            </Select>
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantity</Label>
            <TextInput
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
            />
          </div>

          {/* With Shipping */}
          <div>
            <Label>With Shipping</Label>
            <Checkbox
              name="withShipping"
              checked={form.withShipping}
              onChange={handleChange}
            />
          </div>

          {/* Destination if shipping is true */}
          {form.withShipping && (
            <div className="md:col-span-2">
              <Label>Destination</Label>
              <TextInput
                name="destination"
                value={form.destination}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Total Price */}
          <div className="md:col-span-2">
            <Label>Total Price</Label>
            <TextInput value={totalPrice.toFixed(2)} readOnly />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateOrderForm;
