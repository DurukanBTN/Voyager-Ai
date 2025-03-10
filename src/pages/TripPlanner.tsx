import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import LocationSearch from "@/components/LocationSearch";
import TripDurationPicker from "@/components/TripDurationPicker";
import BudgetSlider from "@/components/BudgetSlider";
import GlassMorphCard from "@/components/GlassMorphCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plane, Calendar, Wallet, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

const TripPlanner = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [tripDetails, setTripDetails] = useState({
    destination: "",
    city: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: 7,
    budget: 2000,
    travelers: 2,
    interests: [] as string[],
  });

  const handleNextStep = () => {
    if (currentStep === 1 && !tripDetails.destination) {
      toast.error("Please select a destination");
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleGenerateItinerary();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLocationSelect = (location: string) => {
    const city = location.split(',')[0].trim();
    setTripDetails({ 
      ...tripDetails, 
      destination: location,
      city: city
    });
  };

  const handleDatesChange = (startDate: Date, endDate: Date, duration: number) => {
    setTripDetails({
      ...tripDetails,
      startDate,
      endDate,
      duration,
    });
  };

  const handleBudgetChange = (budget: number) => {
    console.log("Budget changed to:", budget);
    setTripDetails({ ...tripDetails, budget });
  };

  const handleTravelersChange = (travelers: number) => {
    console.log("Travelers changed to:", travelers);
    setTripDetails({ ...tripDetails, travelers });
  };

  const handleGenerateItinerary = () => {
    setLoading(true);
    
    console.log("Sending trip details to itinerary:", tripDetails);
    
    setTimeout(() => {
      setLoading(false);
      navigate("/itinerary", { state: { tripDetails } });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      step === currentStep
                        ? "bg-primary text-white"
                        : step < currentStep
                        ? "bg-primary/20 text-primary"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step === 1 && <Plane size={20} />}
                    {step === 2 && <Calendar size={20} />}
                    {step === 3 && <Wallet size={20} />}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      step === currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step === 1 && "Destination"}
                    {step === 2 && "Dates"}
                    {step === 3 && "Budget"}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="h-1 w-full bg-gray-200 rounded-full"></div>
              </div>
              <div
                className="absolute inset-0 flex items-center">
                <div
                  className="h-1 bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <GlassMorphCard className="mb-8">
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Where would you like to go?</h2>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  initialValue={tripDetails.destination}
                />
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Popular destinations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {["Paris, France", "Tokyo, Japan", "Bali, Indonesia", "New York, USA"].map(
                      (location) => (
                        <button
                          key={location}
                          onClick={() => handleLocationSelect(location)}
                          className={`p-3 rounded-xl border transition-all ${
                            tripDetails.destination === location
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {location}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">When are you traveling?</h2>
                <TripDurationPicker onDatesChange={handleDatesChange} />
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">How many travelers?</h3>
                  <div className="flex space-x-3 flex-wrap">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleTravelersChange(num)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all mb-2 ${
                          tripDetails.travelers === num
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ width: "80px" }}
                      >
                        <Users className="mb-1" size={20} />
                        <span>{num}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">What's your budget?</h2>
                <BudgetSlider
                  onBudgetChange={handleBudgetChange}
                  initialValue={tripDetails.budget}
                />
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Your budget includes:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">✓</span>
                      <span>Accommodations suitable for your travel style</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">✓</span>
                      <span>Daily activities and attractions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">✓</span>
                      <span>Estimated food and dining expenses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">✓</span>
                      <span>Local transportation costs</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </GlassMorphCard>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button
              onClick={handleNextStep}
              className="flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {currentStep < 3 ? "Next" : "Create Itinerary"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
