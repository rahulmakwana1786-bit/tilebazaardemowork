const ContactInformation = () => {
  return (
    <div className="bg-white text-black">
      <div className="max-w-xs md:max-w-xl mx-auto pt-28">
        <h1 className="text-5xl md:text-6xl text-center pt-10 font-semibold">Contact Information </h1>
      </div>
      <div className="text-sm tracking-wider">
        <div className="max-w-xs md:max-w-xl mx-auto pt-4">
          <div>
            <p>Trade name: Tile Bazaar</p>
            <br />
          
            <p>Email: info@tilebazaar.co.uk</p>
            <br />
            <p>
              Physical address: Unit 10 Slough Interchange Industrial Estate, Whittenham Close, Slough, SL2 5EP
            </p>
            <br />
            <p>VAT number: </p>
            <br />
            <p>Trade number: </p>
            <br />
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;

// export default function ContactInformationPage() {
//   return (
//     <div>
//       <h1>Contact Information</h1>
//     </div>
//   );
// }