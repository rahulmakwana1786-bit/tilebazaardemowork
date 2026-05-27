const ShippingPolicy = () => {
  return (
    <div className="bg-white text-black">
      <div className="max-w-xs md:max-w-xl mx-auto pt-28">
        <h1 className="text-5xl md:text-6xl pt-10 text-center font-semibold">Shipping Policy </h1>
      </div>
      <div className="text-sm tracking-wider">
        <div className="max-w-xs md:max-w-xl mx-auto pt-4">
          <div>
            <h3 className="text-4xl py-4 font-semibold">
              Shipping & Delivery Policy
            </h3>
            <p>
              At Tile Bazaar, we take pride in handling deliveries ourselves to
              ensure your tiles arrive safely and on time.
            </p>
            <br />
            <h3 className="text-4xl py-4 font-semibold">Delivery Time</h3>
            <ul className="list-disc ml-4">
              <li>
                Orders are typically delivered within <b>3–5 business days</b>.
              </li>
              <li>
                Our delivery team will <b>contact you on the day of delivery</b>{" "}
                to arrange a suitable time slot.
              </li>
            </ul>
            <br />
            <h3 className="text-4xl py-4 font-semibold">Delivery Charges</h3>
            <ul className="list-disc ml-4">
              <li>
               <b>devliery charges will be applicable</b>
              </li>
            </ul>
            <br />
            <h3 className="text-4xl py-4 font-semibold">Missed Deliveries</h3>
            <ul className="list-disc ml-4">
              <li>
                If a delivery attempt is missed, a <b>£75 redelivery charge</b>{" "}
                will apply.
              </li>
           
            </ul>
            <br />
            <h3 className="text-4xl py-4 font-semibold">
              Additional Information
            </h3>
            <ul className="list-disc ml-4">
              <li>
                Please ensure someone is available to receive the delivery at
                the agreed time.
              </li>
              <li>Large or bulk orders may require additional coordination.</li>
              <li>
                If there are any access issues or special instructions, please
                inform us in advance to avoid delays.
              </li>
            </ul>
            <br />
           
            <br />
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;

// const ShippingPolicyPage = () => {
//   return (
//     <div>ShippingPolicyPage</div>
//   )
// }

// export default ShippingPolicyPage