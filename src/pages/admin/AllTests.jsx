import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function Row(props) {
  async function handleDelete() {
    try {
      if (window.confirm("Are you sure you want to delete this test?")) {
        const response = await axios.delete(
          `${BACKEND_URL}/delete-test/${props.data._id}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          alert("Test deleted successfully!");
        } else {
          alert("Failed to delete the test.");
        }
      }
    } catch (error) {
      alert("An error occurred while deleting the test.");
      console.error("Error deleting test:", error);
    }
  }

  return (
    <tr>
      <th>{props.number}</th>
      <td>{props.data.question}</td>
      <td>
        {props.data.test.map((item, index) => (
          <div key={index}>
            Input: {item.input}, Output: {item.output}
          </div>
        ))}
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-test/${props.data._id}`}>
          update
        </Link>
      </td>
      <td className="text-error cursor-pointer" onClick={handleDelete}>
        delete
      </td>
    </tr>
  );
}

function AllTests() {
  const [testData, setTestData] = useState([]);

  async function fetchTests() {
    try {
      const response = await axios.get(`${BACKEND_URL}/all-tests`, {
        withCredentials: true,
      });
      setTestData(response?.data);
    } catch (err) {
      setTestData([]);
      console.error("Error fetching tests:", err);
    }
  }

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="h-full w-full  overflow-x-scroll overflow-y-scroll">
      <table className="table table-xs table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th>#</th>
            <td>Question</td>
            <td>Test Cases</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {testData.length > 0 ? (
            testData.map((x, index) => (
              <Row key={index} number={index + 1} data={x} />
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No tests found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <td>Question</td>
            <td>Test Cases</td>
            <td>Update</td>
            <td>Delete</td>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AllTests;