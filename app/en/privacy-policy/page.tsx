export default function PrivacyPolicy() {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container max-w-3xl mx-auto px-4 py-10 md:px-6">
          <img 
            className="block mx-auto mb-5 max-w-[150px]" 
            src="https://seerkel.com/assets/logo_web2.webp" 
            alt="Seerkel Logo" 
          />
          
          <h2 className="text-3xl md:text-[1.8em] font-bold mt-5 mb-4">
            Privacy Policy
          </h2>
          
          <div className="mb-4">
            <p className="mb-4">
              This Privacy Policy describes how Seerkel ("we", "us", or "our") 
              processes personal data in compliance with the General Data Protection 
              Regulation (GDPR) and other relevant data protection laws effective as 
              of November 2024.
            </p>
            <p className="mb-4">
              Seerkel is dedicated to safeguarding your personal information. When 
              personal information is collected, we ensure it is managed with 
              confidentiality, integrity, and in accordance with EU laws.
            </p>
          </div>
  
          <h2 className="text-3xl md:text-[1.8em] font-bold mt-5 mb-4">
            Information We Collect
          </h2>
          <div className="mb-4">
            <p className="mb-4">
              We may collect personal data when you use our services, such as name, 
              email address, location data, and any other data necessary for the 
              functionality of our service. This information is only collected with 
              your explicit consent, ensuring full transparency.
            </p>
            <p className="mb-4">
              Our processing of personal data is grounded on legal bases under GDPR, 
              including user consent, contract performance, and legitimate interest. 
              Seerkel uses personal data solely for legitimate purposes, such as 
              service improvement and user experience enhancement.
            </p>
          </div>
  
          {/* Add remaining sections */}
          
          <h2 className="text-3xl md:text-[1.8em] font-bold mt-5 mb-4">
            Your Rights under GDPR
          </h2>
          <div className="mb-4">
            <p className="mb-4">
              Under GDPR, you have rights to access, rectify, erase, restrict, or 
              object to the processing of your personal data. You also have the right 
              to data portability and to withdraw consent at any time.
            </p>
            <p className="mb-4">
              If you wish to exercise any of these rights, please contact us through 
              our designated Data Protection Officer (DPO) at{' '}
              <a 
                href="mailto:dpo@seerkel.com"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                dpo@seerkel.com
              </a>
              . We respond to requests promptly, ensuring your rights are respected.
            </p>
          </div>
        </div>
      </div>
    );
  }