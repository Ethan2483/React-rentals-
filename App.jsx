import { useEffect, useMemo, useState } from "react";

const carsData = {
  sedan: [
    { name: "Honda City", price: 2500, wiki: "Honda City" },
    { name: "Hyundai Verna", price: 2800, wiki: "Hyundai Verna" },
    { name: "Skoda Slavia", price: 3000, wiki: "Škoda Slavia" },
    { name: "Skoda Octavia", price: 4000, wiki: "Škoda Octavia" },
    { name: "BMW M2", price: 7500, wiki: "BMW M2" },
    { name: "Volkswagen Vento", price: 2400, wiki: "Volkswagen Vento" }
  ],
  suv: [
    { name: "Mahindra XUV700", price: 3500, wiki: "Mahindra XUV700" },
    { name: "BMW X7", price: 12000, wiki: "BMW X7" },
    { name: "Toyota Fortuner", price: 5000, wiki: "Toyota Fortuner" },
    { name: "Toyota Land Cruiser", price: 15000, wiki: "Toyota Land Cruiser" },
    { name: "MG Gloster", price: 5500, wiki: "MG Gloster" },
    { name: "Mercedes-Benz GLS", price: 14000, wiki: "Mercedes-Benz GLS-Class" }
  ],
  convertible: [
    { name: "BMW Z4", price: 10000, wiki: "BMW Z4" },
    { name: "Audi A5 Cabriolet", price: 9000, wiki: "Audi A5" },
    { name: "Mercedes-Benz C-Class Cabriolet", price: 11000, wiki: "Mercedes-Benz C-Class" },
    { name: "MINI Cooper Convertible", price: 6500, wiki: "Mini Convertible" },
    { name: "Jaguar F-Type", price: 13000, wiki: "Jaguar F-Type" },
    { name: "Porsche 718 Boxster", price: 15000, wiki: "Porsche Boxster" }
  ]
};

const DELIVERY_CHARGE = 500;
const money = (amount) => Number(amount || 0).toLocaleString("en-IN");
const getDays = (from, to) => {
  if (!from || !to) return 0;
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
};

function CarCard({ car, onSelect }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadImage() {
      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(car.wiki)}`
        );
        if (!response.ok) throw new Error("Image unavailable");
        const data = await response.json();
        if (active) setImage(data.thumbnail?.source || "");
      } catch {
        if (active) setImage("");
      }
    }
    loadImage();
    return () => { active = false; };
  }, [car.wiki]);

  return (
    <article className="car-card">
      {image ? (
        <img src={image} alt={car.name} />
      ) : (
        <div className="image-placeholder">🚘 {car.name}</div>
      )}
      <div className="car-info">
        <h3>{car.name}</h3>
        <p className="price">₹{money(car.price)} / day</p>
        <button className="rent-btn" onClick={() => onSelect(car)}>
          Rent This Car
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [category, setCategory] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [address, setAddress] = useState("");
  const [stage, setStage] = useState("home");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const days = getDays(fromDate, toDate);
  const rentalTotal = selectedCar && days > 0 ? selectedCar.price * days : (selectedCar?.price || 0);
  const deliveryTotal = deliveryOption === "delivery" ? DELIVERY_CHARGE : 0;
  const grandTotal = rentalTotal + deliveryTotal;

  const today = useMemo(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }, []);

  function chooseCar(car) {
    setSelectedCar(car);
    setFromDate("");
    setToDate("");
    setDeliveryOption("pickup");
    setAddress("");
    setError("");
    setStage("booking");
    window.setTimeout(() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function continueToPayment() {
    setError("");
    if (!selectedCar) return setError("Please select a car first.");
    if (!fromDate || !toDate) return setError("Please select both rental dates.");
    if (days <= 0) return setError("To Date must be after From Date.");
    if (deliveryOption === "delivery" && !address.trim()) return setError("Please enter your home delivery address.");

    const currentBooking = {
      car: selectedCar,
      fromDate,
      toDate,
      days,
      deliveryOption,
      address: address.trim(),
      rentalTotal: selectedCar.price * days,
      deliveryTotal,
      total: grandTotal
    };
    setBooking(currentBooking);
    setStage("payment");
    window.setTimeout(() => document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function confirmDemoPayment() {
    if (!booking) return;
    setStage("success");
    window.setTimeout(() => document.getElementById("success")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function backHome() {
    setStage("home");
    setCategory("");
    setSelectedCar(null);
    setBooking(null);
    setFromDate("");
    setToDate("");
    setAddress("");
    setDeliveryOption("pickup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <header>
        <h1>🚗 DriveNow Rentals</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#cars">Cars</a>
          <a href="#booking">Booking</a>
          <a href="#payment">Payment</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <h2>Rent Your Dream Car</h2>
        <p>Choose your car and enjoy your journey!</p>
      </section>

      <section id="cars">
        <h2>Choose Car Category</h2>
        <div className="category-container">
          <button className="category-card" onClick={() => setCategory("sedan")}>
            <span className="category-icon">🚘</span>
            <h3>Sedan</h3>
            <p>Comfortable family and luxury cars</p>
          </button>
          <button className="category-card" onClick={() => setCategory("suv")}>
            <span className="category-icon">🚙</span>
            <h3>SUV</h3>
            <p>Powerful and spacious vehicles</p>
          </button>
          <button className="category-card" onClick={() => setCategory("convertible")}>
            <span className="category-icon">🏎️</span>
            <h3>Convertible</h3>
            <p>Stylish open-top cars</p>
          </button>
        </div>
      </section>

      {category && (
        <section id="models">
          <div className="section-heading">
            <h2>Available {category.charAt(0).toUpperCase() + category.slice(1)} Cars</h2>
            <button className="back-btn" onClick={() => setCategory("")}>Hide cars</button>
          </div>
          <div className="models-container">
            {carsData[category].map((car) => (
              <CarCard key={car.name} car={car} onSelect={chooseCar} />
            ))}
          </div>
        </section>
      )}

      {stage === "booking" && selectedCar && (
        <section id="booking">
          <h2>Book Your Car</h2>
          <div className="form-box">
            <div className="booking-summary">
              <p><strong>Selected Car:</strong> {selectedCar.name}</p>
              <p><strong>Price:</strong> ₹{money(selectedCar.price)} / day</p>
              <p><strong>Rental Days:</strong> {days > 0 ? days : "Select dates"}</p>
              <p><strong>Rental Total:</strong> ₹{money(rentalTotal)}</p>
              <p><strong>Delivery Charge:</strong> ₹{money(deliveryTotal)}</p>
              <p><strong>Grand Total:</strong> ₹{money(grandTotal)}</p>
            </div>

            <div className="form-group">
              <label htmlFor="fromDate">From Date</label>
              <input id="fromDate" type="date" min={today} value={fromDate}
                onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="toDate">To Date</label>
              <input id="toDate" type="date" min={fromDate || today} value={toDate}
                onChange={(e) => setToDate(e.target.value)} />
            </div>

            <div className="delivery-box">
              <div className="form-group">
                <label htmlFor="deliveryOption">🚚 Car Delivery Option</label>
                <select id="deliveryOption" value={deliveryOption}
                  onChange={(e) => setDeliveryOption(e.target.value)}>
                  <option value="pickup">🏢 Pick up from Rental Office</option>
                  <option value="delivery">🏠 Home Delivery (+₹500)</option>
                </select>
              </div>
              <p className="delivery-charge">Home delivery charge: ₹500</p>
            </div>

            {deliveryOption === "delivery" && (
              <div className="form-group">
                <label htmlFor="address">📍 Home Delivery Address</label>
                <textarea id="address" rows="4" placeholder="Enter your complete home address"
                  value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            )}
            {error && <p className="error-message">{error}</p>}
            <button className="submit-btn" onClick={continueToPayment}>Continue to Payment</button>
          </div>
        </section>
      )}

      {stage === "payment" && booking && (
        <section id="payment">
          <h2>Payment</h2>
          <div className="form-box">
            <div className="booking-summary">
              <p><strong>Car:</strong> {booking.car.name}</p>
              <p><strong>Rental Period:</strong> {booking.fromDate} to {booking.toDate} ({booking.days} days)</p>
              <p><strong>Delivery:</strong> {booking.deliveryOption === "delivery" ? "🏠 Home Delivery (+₹500)" : "🏢 Rental Office Pickup"}</p>
              <p><strong>Address:</strong> {booking.address || "Not Required"}</p>
              <p><strong>Total Amount:</strong> ₹{money(booking.total)}</p>
            </div>
            <div className="demo-notice">
              This is a student project demo. No real card details or payments are collected.
            </div>
            <button className="submit-btn" onClick={confirmDemoPayment}>Confirm Demo Booking</button>
            <button className="back-btn full-width" onClick={() => setStage("booking")}>Back to Booking</button>
          </div>
        </section>
      )}

      {stage === "success" && booking && (
        <section id="success">
          <div className="success-box">
            <div className="success-icon">✅</div>
            <h2>Booking Successful!</h2>
            <div className="success-details">
              <p><strong>🚗 Car:</strong> {booking.car.name}</p>
              <p><strong>📅 Rental Period:</strong> {booking.fromDate} to {booking.toDate}</p>
              <p><strong>🚚 Delivery:</strong> {booking.deliveryOption === "delivery" ? "Home Delivery" : "Pickup from Rental Office"}</p>
              {booking.address && <p><strong>📍 Address:</strong> {booking.address}</p>}
              <p><strong>💰 Total Amount:</strong> ₹{money(booking.total)}</p>
              <p>Your demo booking has been confirmed successfully!</p>
            </div>
            <button className="rent-btn home-button" onClick={backHome}>Back to Home</button>
          </div>
        </section>
      )}

      <footer>
        <p>© 2026 DriveNow Rentals | All Rights Reserved</p>
      </footer>
    </>
  );
}
