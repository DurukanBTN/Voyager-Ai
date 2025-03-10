import { useState, useEffect } from "react";
import { startGumloopPipeline, getPipelineRunStatus } from "@/utils/gumloopApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassMorphCard from "./GlassMorphCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Users } from "lucide-react";

interface GumloopApiTestProps {
  className?: string;
  city?: string;
  autoStart?: boolean;
  budget?: number;
  travelers?: number;
  interests?: string[];
  startDate?: Date;
  endDate?: Date;
}

const GumloopApiTest = ({ 
  className, 
  city = "Paris", 
  autoStart = false,
  budget = 1000,
  travelers = 2,
  interests = ["anything"],
  startDate = new Date(),
  endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}: GumloopApiTestProps) => {
  const [userId, setUserId] = useState("1y5cS7wht6QDSjLHGBJOi6vu19y1");
  const [savedItemId, setSavedItemId] = useState("veV5ZPJy5nYw4pQGdceWD5");
  const [apiKey, setApiKey] = useState("4997b5ac80a9402d977502ac41891eec");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [runId, setRunId] = useState("");
  const [runStatus, setRunStatus] = useState("");
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  
  useEffect(() => {
    if (autoStart) {
      handleTestApi();
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [autoStart, city]);

  const startTimer = () => {
    setElapsedTime(0);
    const interval = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
    return interval;
  };

  const stopTimer = (interval: number) => {
    clearInterval(interval);
    setTimerInterval(null);
  };
  
  const handleTestApi = async () => {
    if (!savedItemId.trim()) {
      toast.error("Please enter a workbook ID");
      return;
    }
    
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    
    setLoading(true);
    setRunStatus("Starting pipeline...");
    setRunLogs([]);
    const timerInt = startTimer();
    
    try {
      console.log(`Starting Gumloop pipeline with city: ${city}, budget: ${budget}, travelers: ${travelers}`);
      console.log(`Travel dates: ${format(startDate, "MMMM do")} - ${format(endDate, "MMMM do")}`);
      
      const formattedStartDate = format(startDate, "MMMM do");
      const formattedEndDate = format(endDate, "MMMM do");
      
      const pipelineInputs = [
        { input_name: "destination", value: city },
        { input_name: "budget", value: budget.toString() },
        { input_name: "num_travelers", value: travelers.toString() },
        { input_name: "start_date", value: formattedStartDate },
        { input_name: "end_date", value: formattedEndDate }
      ];
      
      console.log("Gumloop API Inputs:", {
        userId,
        savedItemId,
        apiKey: apiKey.substring(0, 4) + "...",
        pipelineInputs
      });
      
      const pipelineResponse = await startGumloopPipeline(
        userId,
        savedItemId,
        apiKey,
        pipelineInputs
      );
      
      console.log("Gumloop Pipeline Response:", pipelineResponse);
      
      if (pipelineResponse && pipelineResponse.run_id) {
        setRunId(pipelineResponse.run_id);
        await pollPipelineStatus(pipelineResponse.run_id, timerInt);
      } else {
        throw new Error("Failed to start pipeline");
      }
    } catch (error) {
      console.error("Gumloop API test failed:", error);
      toast.error("Failed to fetch data from Gumloop");
      stopTimer(timerInt);
      setLoading(false);
    }
  };
  
  const pollPipelineStatus = async (runId: string, timerInt: number) => {
    try {
      let isComplete = false;
      let attempts = 0;
      
      while (!isComplete && attempts < 60) {
        attempts++;
        
        const statusResponse = await getPipelineRunStatus(runId, userId, apiKey);
        console.log("Gumloop Pipeline Status (attempt " + attempts + "):", statusResponse);
        
        setRunStatus(statusResponse.state);
        if (statusResponse.log && statusResponse.log.length > 0) {
          setRunLogs(statusResponse.log.filter((log: string) => !log.includes("__system__")));
        }
        
        if (statusResponse.state === "COMPLETED" || statusResponse.state === "ERROR" || statusResponse.outputs) {
          isComplete = true;
          setResults(statusResponse);
          
          // Print the complete output directly
          console.log("🔥 COMPLETE GUMLOOP API OUTPUT:", JSON.stringify(statusResponse, null, 2));
          
          if (statusResponse.state === "COMPLETED") {
            toast.success("Successfully fetched data from Gumloop!");
          } else if (statusResponse.state === "ERROR") {
            toast.error("Pipeline encountered an error");
          }
          stopTimer(timerInt);
          setLoading(false);
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      if (!isComplete) {
        toast.error("Pipeline taking too long, please check later");
        stopTimer(timerInt);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error polling pipeline status:", error);
      toast.error("Failed to check pipeline status");
      stopTimer(timerInt);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <GlassMorphCard className={className}>
      <h2 className="text-xl font-semibold mb-4">Gumloop API Connection</h2>
      
      <div className="space-y-4">
        {!autoStart && (
          <>
            <div className="space-y-2">
              <Label htmlFor="workbook-id">Gumloop Workbook ID</Label>
              <Input
                id="workbook-id"
                value={savedItemId}
                onChange={(e) => setSavedItemId(e.target.value)}
                placeholder="Enter your workbook ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">Gumloop API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is only stored locally in your browser and is never sent to our servers.
              </p>
            </div>
          </>
        )}
        
        {city && <p className="text-sm text-muted-foreground">Destination: {city}</p>}
        
        {!autoStart && (
          <Button 
            onClick={handleTestApi} 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Testing..." : "Test Connection"}
          </Button>
        )}
      </div>
      
      {loading && (
        <div className="mt-4 flex flex-col items-center p-4 bg-primary/5 rounded-lg">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
          <p className="text-primary font-medium">Processing your travel data...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Elapsed time: {formatTime(elapsedTime)}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div className="bg-primary h-2.5 rounded-full animate-progress"></div>
          </div>
          
          {runStatus && (
            <p className="text-sm text-muted-foreground mt-2">
              Status: {runStatus}
            </p>
          )}
          
          {runLogs.length > 0 && (
            <div className="mt-2 w-full">
              <p className="text-xs font-medium">Recent logs:</p>
              <div className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded-md max-h-20 overflow-y-auto">
                {runLogs.slice(-3).map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {results && !loading && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Results:</h3>
          <pre className="bg-secondary/30 p-4 rounded-md overflow-auto max-h-[400px] text-xs whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results.outputs && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Processed Outputs:</h3>
              <div className="space-y-2">
                {Object.entries(results.outputs).map(([key, value]) => (
                  <div key={key} className="bg-secondary/20 p-3 rounded-md">
                    <div className="font-semibold text-sm mb-1">{key}:</div>
                    <div className="text-sm overflow-auto max-h-[100px]">
                      {Array.isArray(value) 
                        ? (
                          <ul className="list-disc pl-5">
                            {value.map((item, i) => (
                              <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                            ))}
                          </ul>
                        )
                        : typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : String(value)
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassMorphCard>
  );
};

export default GumloopApiTest;
