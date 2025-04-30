import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function UpdateTest() {
  const { id } = useParams();
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

  useEffect(() => {
    async function fetchTest() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/show-test/${id}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          const { _id, __v, ...filteredData } = response.data;
          setFormData(filteredData);
        }
      } catch (err) {
        showAlert("Failed to load test data.", "error");
      }
    }
    fetchTest();
  }, [id]);

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

  const validateForm = () => {
    const errors = [];
    if (!formData.question.trim()) {
      errors.push("Question is required.");
    }
    if (formData.test.length === 0) {
      errors.push("At least one test case is required.");
    }
    formData.test.forEach((item, index) => {
      const testCaseErrors = [];
      if (!item.input.trim()) {
        testCaseErrors.push("Input is required.");
      }
      if (!item.output.trim()) {
        testCaseErrors.push("Output is required.");
      }
      if (testCaseErrors.length > 0) {
        errors.push(`Test Case ${index + 1}: ${testCaseErrors.join(", ")}`);
      }
    });

    if (errors.length > 0) {
      showAlert(errors.join(" | "), "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.put(
        `${BACKEND_URL}/update-test/${id}`,
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Test updated successfully!", "success");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to update test.", "error");
    }
  };

  return (
    <div className="h-full bg-gray-950 overflow-y-auto p-4 flex flex-col items-start pb-[100px] sm:pb-[0px]">
      <div className="w-full sm:w-2/3 bg-base-300 p-3 sm:p-7 rounded-2xl border-2 border-sky-500 s-form text-center">
        <h1 className="text-4xl">Update Test</h1>
        <form onSubmit={handleSubmit}>
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
                  type="button"
                  onClick={() => removeTestCase(index)}
                  className="btn btn-error btn-sm mt-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="btn btn-secondary btn-sm mt-3"
          >
            Add Test Case
          </button>
          <button type="submit" className="btn w-full mt-3 btn-info">
            Update Test
          </button>
        </form>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
              alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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

export default UpdateTest;