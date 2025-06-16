import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Spinner, Label, TextInput, Select, Checkbox, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  const [form, setForm] = useState({
    location: '',
    productname: '',
    unit: '',
    producttype: '',
    holdingstatus: '',
    quantity: 1,
    withShipping: false,
    destination: '',
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/price/getallprices');
        const data = await res.json();
        setPrices(data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const getUnique = (arr, key) => [...new Set(arr.map(item => item[key]))].filter(Boolean);

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

  const uniqueUnits = getUnique(
    prices.filter(p =>
      p.salesLocation === form.location &&
      p.productName === form.productname &&
      p.productType === form.producttype &&
      String(p.withHolding) === form.holdingstatus
    ),
    'unit'
  );

  useEffect(() => {
    const matchedPrice = prices.find(price =>
      price.salesLocation === form.location &&
      price.productName === form.productname &&
      price.productType === form.producttype &&
      String(price.withHolding) === form.holdingstatus &&
      price.unit === form.unit
    );

    if (matchedPrice && matchedPrice.prices?.length > 0) {
      const unitPrice = matchedPrice.prices[0].amount;
      setPricePerUnit(unitPrice);
      setTotalPrice(unitPrice * form.quantity);
    } else {
      setPricePerUnit(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.location || !form.productname || !form.producttype || !form.holdingstatus || !form.quantity || !form.unit) {
      alert('Please fill all required fields');
      return;
    }
    if (form.withShipping && !form.destination) {
      alert('Please provide a destination when shipping is selected');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/order/createorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesLocation: form.location,
          productName: form.productname,
          productType: form.producttype,
          withHolding: form.holdingstatus,
          pricePerUnit: pricePerUnit,
          totalPrice: totalPrice,
          unit: form.unit,
          quantity: Number(form.quantity),
          withShipping: form.withShipping,
          destination: form.withShipping ? form.destination : '',
          role: currentUser?.role || '',
          createdBy: currentUser?._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to create order');
      } else {
        alert('Order created successfully!');
        navigate('/orders');
      }
    } catch (err) {
      console.error('Create order error:', err);
      alert('Server error, please try again later');
    } finally {
      setSubmitting(false);
    }
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Product Location</Label>
              <Select name="location" value={form.location} onChange={handleChange}>
                <option value="">Select location</option>
                {uniqueLocations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Product Name</Label>
              <Select name="productname" value={form.productname} onChange={handleChange}>
                <option value="">Select product</option>
                {productNames.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Product Type</Label>
              <Select name="producttype" value={form.producttype} onChange={handleChange}>
                <option value="">Select type</option>
                {productTypes.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Holding Status</Label>
              <Select name="holdingstatus" value={form.holdingstatus} onChange={handleChange}>
                <option value="">Select status</option>
                {holdingStatuses.map((status, i) => (
                  <option key={i} value={String(status)}>{String(status)}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Unit</Label>
              <Select name="unit" value={form.unit} onChange={handleChange}>
                <option value="">Select unit</option>
                {uniqueUnits.map((unit, i) => (
                  <option key={i} value={unit}>{unit}</option>
                ))}
              </Select>
            </div>

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

            <div>
              <Label>With Shipping</Label>
              <Checkbox
                name="withShipping"
                checked={form.withShipping}
                onChange={handleChange}
              />
            </div>

            {form.withShipping && (
              <div>
                <Label>Destination</Label>
                <TextInput
                  type="text"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="Enter destination"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <Label>Price per Unit: ${pricePerUnit}</Label>
            <br />
            <Label>Total Price: ${totalPrice}</Label>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button color="gray" onClick={() => navigate('/orders')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateOrder; 