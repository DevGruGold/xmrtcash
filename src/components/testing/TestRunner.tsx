
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TestRunnerProps {
  contractAddress: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: Test[];
  selected: boolean;
}

interface Test {
  id: string;
  name: string;
  status: "idle" | "running" | "passed" | "failed";
  error?: string;
}

export default function TestRunner({ contractAddress }: TestRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suites, setSuites] = useState<TestSuite[]>([
    {
      id: "basic",
      name: "Basic Contract Tests",
      description: "Tests for basic ERC20 functionality and initialization",
      selected: true,
      tests: [
        { id: "b1", name: "Should initialize with correct name and symbol", status: "idle" },
        { id: "b2", name: "Should mint total supply to admin", status: "idle" },
        { id: "b3", name: "Should set up roles correctly", status: "idle" },
        { id: "b4", name: "Should have correct constants defined", status: "idle" },
      ]
    },
    {
      id: "wrapping",
      name: "Monero Wrapping Tests",
      description: "Tests for wrapping and unwrapping Monero",
      selected: true,
      tests: [
        { id: "w1", name: "Should wrap Monero correctly", status: "idle" },
        { id: "w2", name: "Should unwrap Monero correctly", status: "idle" },
        { id: "w3", name: "Should enforce bridge fee payment", status: "idle" },
        { id: "w4", name: "Should update wrapped Monero balances", status: "idle" },
      ]
    },
    {
      id: "fiat",
      name: "Fiat Ramp Tests",
      description: "Tests for on-ramping and off-ramping fiat",
      selected: true,
      tests: [
        { id: "f1", name: "Should on-ramp fiat correctly", status: "idle" },
        { id: "f2", name: "Should off-ramp fiat correctly", status: "idle" },
        { id: "f3", name: "Should calculate fees correctly", status: "idle" },
        { id: "f4", name: "Should update CashDapp state", status: "idle" },
      ]
    }
  ]);
  
  const toggleSuite = (suiteId: string) => {
    setSuites(suites.map(suite => 
      suite.id === suiteId ? { ...suite, selected: !suite.selected } : suite
    ));
  };
  
  const runTests = () => {
    if (!contractAddress) {
      toast({
        title: "Error",
        description: "Please enter a contract address first",
        variant: "destructive"
      });
      return;
    }
    
    const selectedSuites = suites.filter(s => s.selected);
    if (selectedSuites.length === 0) {
      toast({
        title: "No test suites selected",
        description: "Please select at least one test suite to run",
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    setProgress(0);
    
    // Reset test statuses
    setSuites(suites.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({
        ...test,
        status: suite.selected ? "idle" : test.status,
        error: undefined
      }))
    })));
    
    // Calculate total tests
    const totalTests = selectedSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
    let completedTests = 0;
    
    // Simulate running tests
    const runNextTest = (suiteIndex: number, testIndex: number) => {
      if (suiteIndex >= selectedSuites.length) {
        setIsRunning(false);
        toast({
          title: "Tests completed",
          description: `All selected test suites completed execution`
        });
        return;
      }
      
      const currentSuite = selectedSuites[suiteIndex];
      if (testIndex >= currentSuite.tests.length) {
        // Move to next suite
        runNextTest(suiteIndex + 1, 0);
        return;
      }
      
      const currentTest = currentSuite.tests[testIndex];
      
      // Update current test to running
      setSuites(suites.map(suite => 
        suite.id === currentSuite.id ? {
          ...suite,
          tests: suite.tests.map(test => 
            test.id === currentTest.id ? { ...test, status: "running" } : test
          )
        } : suite
      ));
      
      // Simulate test execution
      setTimeout(() => {
        // Randomly pass or fail tests (80% pass rate)
        const passed = Math.random() < 0.8;
        
        // Update test status
        setSuites(suites.map(suite => 
          suite.id === currentSuite.id ? {
            ...suite,
            tests: suite.tests.map(test => 
              test.id === currentTest.id ? { 
                ...test, 
                status: passed ? "passed" : "failed",
                error: passed ? undefined : "Expected value did not match actual value"
              } : test
            )
          } : suite
        ));
        
        // Update progress
        completedTests++;
        setProgress(Math.floor((completedTests / totalTests) * 100));
        
        // Run next test
        runNextTest(suiteIndex, testIndex + 1);
      }, 700);
    };
    
    // Start running tests
    runNextTest(0, 0);
  };
  
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <AlertCircle className="h-5 w-5 text-amber-500 animate-pulse" />;
      default:
        return <div className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Test Suites</h3>
        <Button 
          onClick={runTests}
          className="bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
          disabled={isRunning}
        >
          <Play className="mr-2 h-4 w-4" />
          Run Tests
        </Button>
      </div>
      
      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Running tests...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="space-y-4">
        {suites.map(suite => (
          <div key={suite.id} className="bg-mocha-50/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={`suite-${suite.id}`}
                  checked={suite.selected}
                  onCheckedChange={() => toggleSuite(suite.id)}
                />
                <label 
                  htmlFor={`suite-${suite.id}`}
                  className="font-semibold text-mocha-900 cursor-pointer"
                >
                  {suite.name}
                </label>
              </div>
              <span className="text-xs bg-mocha-200/50 px-2 py-1 rounded">
                {suite.tests.filter(t => t.status === "passed").length}/
                {suite.tests.length} passed
              </span>
            </div>
            
            <p className="text-sm text-mocha-600 mb-3">{suite.description}</p>
            
            <div className="space-y-2 ml-7">
              {suite.tests.map(test => (
                <div key={test.id} className="flex items-center justify-between py-1 border-b border-mocha-200/50">
                  <div className="flex items-center space-x-2">
                    {getTestStatusIcon(test.status)}
                    <span className="text-sm">{test.name}</span>
                  </div>
                  {test.error && (
                    <span className="text-xs text-red-500">{test.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
