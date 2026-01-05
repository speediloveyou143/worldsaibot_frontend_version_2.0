import React, { useState, useEffect } from "react";
import APIService from "../../services/api";

function CreateTest() {
  const [formData, setFormData] = useState({
    question: "",
    test: [{ input: "", output: "" }],
  });
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === "question") {
      setFormData({ ...formData, question: value });
    } else {
      const updatedTest = [...formData.test];
      updatedTest[index][name] = value;
      setFormData({ ...formData, test: updatedTest });
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      test: [...formData.test, { input: "", output: "" }],
    });
  };

  const removeTestCase = (index) => {
    const updatedTest = formData.test.filter((_, i) => i !== index);
    setFormData({ ...formData, test: updatedTest });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.question) {
        showAlert("Question is required.", "error");
        return;
      }
      if (formData.test.length === 0) {
        showAlert("At least one test case is required.", "error");
        return;
      }
      const invalidTest = formData.test.some(
        (item) => !item.input || !item.output
      );
      if (invalidTest) {
        showAlert("Each test case must have both input and output.", "error");
        return;
      }

      const response = await APIService.tests.create(formData);
      if (response.status === 200 || response.status === 201) {
        showAlert("Test created successfully!", "success");
        setFormData({ question: "", test: [{ input: "", output: "" }] });
      } else {
        showAlert("Test not created.", "error");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Something went wrong while creating the test.", "error");
    }
  };

  return (
    <div className="h-full bg-gray-950 p-4 flex flex-col items-start">
      <div className="w-full sm:w-2/3 bg-base-300 p-3 sm:p-7 rounded-2xl border-2 border-sky-500 s-form text-center mb-8">
        <h1 className="text-4xl">Create Test</h1>
        <label className="input input-bordered flex items-center gap-2 mt-3">
          Question:
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="grow"
          />
        </label>
        {formData.test.map((testCase, index) => (
          <div key={index} className="mt-3">
            <label className="input input-bordered flex items-center gap-2">
              Input:
              <input
                type="text"
                name="input"
                value={testCase.input}
                onChange={(e) => handleChange(e, index)}
                className="grow"
              />
            </label>
            <label className="input input-bordered flex items-center gap-2 mt-2">
              Output:
              <input
                type="text"
                name="output"
                value={testCase.output}
                onChange={(e) => handleChange(e, index)}
                className="grow"
              />
            </label>
            {formData.test.length > 1 && (
              <button
                onClick={() => removeTestCase(index)}
                className="btn btn-error btn-sm mt-2"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTestCase}
          className="btn btn-secondary btn-sm mt-3"
        >
          Add Test Case
        </button>
        <button onClick={handleSubmit} className="btn w-full mt-3 btn-info">
          Create Test
        </button>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              } flex flex-col w-80`}
          >
            <div className="flex items-center space-x-2">
              <span className="flex-1">{alert.message}</span>
              <button
                onClick={dismissAlert}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateTest;