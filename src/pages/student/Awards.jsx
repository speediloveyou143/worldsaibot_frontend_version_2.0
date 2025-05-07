
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import axios from "axios";
import { BACKEND_URL } from '../../../config/constant';

const CertificateCard = ({ data, type, onDownload }) => {
  const getTitle = () => {
    switch (type) {
      case "program":
        return "Certificate of Course Completion";
      case "participation":
        return "Certificate of Participation";
      case "internship":
        return "Internship Certificate";
      default:
        return "Certificate";
    }
  };

  return (
    <div className="w-full bg-gray-900/50 text-center pb-0 border border-blue-800/30 rounded-xl">
      <div className="relative w-full bg-gray-900 border-2 text-center border-blue-800/50 p-6">
        <div className="absolute inset-0 m-3 border border-blue-600/50" />
        <div className="flex flex-col items-center justify-between min-h-[500px] md:min-h-[600px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              W
            </div>
            <h4 className="text-xl font-bold text-blue-400 mb-2">
              {data.companyName}
            </h4>
            <h3 className="text-2xl font-bold text-white">{getTitle()}</h3>
            <p className="text-gray-400 italic">This is to certify that</p>
            <p className="text-xl mt-2 font-bold text-white break-all whitespace-normal w-full">
              {data.recipientName.toUpperCase()}
            </p>

            {type === "program" && (
              <>
                <p className="text-gray-300">has successfully completed the program in</p>
                <p className="text-lg font-bold text-blue-400">
                  {data.courseName}
                </p>
                <p className="text-sm text-gray-400">
                  Duration: {data.startDate} to {data.endDate}
                </p>
              </>
            )}

            {type === "participation" && (
              <>
                <p className="text-gray-300">has actively participated in the event</p>
                <p className="text-lg font-bold text-blue-400">
                  {data.courseName} Bootcamp
                </p>
                <p className="text-sm text-gray-400">
                  Duration: {data.startDate} to {data.endDate}
                </p>
              </>
            )}

            {type === "internship" && (
              <>
                <p className="text-gray-300">has successfully completed internship as</p>
                <p className="text-lg font-bold text-blue-400">
                  {data.courseName} Intern
                </p>
                <p className="text-sm text-gray-400">
                  Duration: {data.startDate} to {data.endDate}
                </p>
              </>
            )}
          </div>

          <div className="w-full text-center">
            <p className="text-sm text-gray-400 mb-8">{data.credentials}</p>
            <div className="flex justify-between text-xs text-gray-400 px-4">
              <span>Issued Date: {data.endDate}</span>
              <span>ID: {data.certificateId}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-white">{data.programDirector}</p>
              <div className="w-32 mx-auto border-t border-gray-400" />
              <p className="text-xs text-gray-400">Program Director</p>
            </div>
          </div>
        </div>
      </div>
      <button
        className="px-6 mt-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
        onClick={onDownload}
      >
        Download Certificate
      </button>
    </div>
  );
};

function Awards() {
  const { user } = useSelector((state) => state.user || {});
  const id = user?._id || "null";
  const [certificates, setCertificates] = useState({
    pCertificates: [],
    iCertificates: [],
    cCertificates: [],
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

  const programCertificateData = {
    companyName: "WorldsAiBot",
    name: "Certified Python Developer",
    recipientName: "John Doe",
    description:
      "Awarded for successfully completing the comprehensive Python Full Stack Development Program with excellence.",
    startDate: "01-Jan-2023",
    endDate: "30-Jun-2023",
    courseName: "Python Full Stack Web Development",
    certificateId: "WAB-2023-PY-001",
    programDirector: "N.Prasanth Kumar",
    credentials:
      "This e-certificate validates the successful completion of the program, including practical projects and assessments.",
  };

  const participationCertificateData = {
    companyName: "WorldsAiBot",
    recipientName: "John Doe",
    eventName: "Course Name",
    startDate: "01-Jan-2023",
    endDate: "05-Jan-2023",
    certificateId: "WAB-2023-BT-001",
    programDirector: "N.Prasanth Kumar",
    credentials:
      "This e-certificate is awarded for active participation in the event.",
  };

  const internshipCertificateData = {
    companyName: "WorldsAiBot",
    recipientName: "John Doe",
    position: "Full Stack Developer Intern",
    startDate: "01-Jan-2023",
    endDate: "30-Jun-2023",
    certificateId: "WAB-2023-IN-001",
    programDirector: "N.Prasanth Kumar",
    credentials:
      "This e-certificate is awarded for successfully completing the internship program.",
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        showAlert("Fetching your certificates...", "info");
        const response = await axios.get(`${BACKEND_URL}/show-user/${id}`,{withCredentials:true});
        setCertificates(response.data);
        showAlert("Certificates loaded successfully!", "success");
      } catch (error) {
        showAlert(`Error fetching certificates: ${error.message}`, "error");
      }
    };

    if (id !== "null") {
      fetchCertificates();
    } else {
      showAlert("No user ID found. Showing sample certificates.", "info");
    }
  }, [id]);

  useEffect(() => {
    if (
      certificates.pCertificates.length === 0 &&
      certificates.iCertificates.length === 0 &&
      certificates.cCertificates.length === 0 &&
      id !== "null"
    ) {
      showAlert("No certificates found. Showing sample certificates.", "info");
    }
  }, [certificates, id]);

  const generateCertificate = (certificate, type) => {
    const certData = {
      companyName: certificate.companyName || "WorldsAiBot",
      recipientName: certificate.recipientName || "Recipient Name",
      courseName: certificate.courseName || "Course Name",
      startDate: certificate.startDate || "Start Date",
      endDate: certificate.endDate || "End Date",
      certificateId: certificate.certificateId || "CERT-001",
      programDirector: certificate.programDirector || "N.Prasanth Kumar",
      credentials:
        certificate.credentials ||
        "This e-certificate validates the successful completion of the program.",
    };

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(10, 20, 30, 20);
    doc.line(20, 10, 20, 30);
    doc.line(pageWidth - 30, 20, pageWidth - 10, 20);
    doc.line(pageWidth - 20, 10, pageWidth - 20, 30);
    doc.line(10, pageHeight - 20, 30, pageHeight - 20);
    doc.line(20, pageHeight - 30, 20, pageHeight - 10);
    doc.line(pageWidth - 30, pageHeight - 20, pageWidth - 10, pageHeight - 20);
    doc.line(pageWidth - 20, pageHeight - 30, pageWidth - 20, pageHeight - 10);

    // Styled "W" Logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(60);
    doc.setTextColor(59, 130, 246);
    doc.text("W", pageWidth / 2, 50, { align: "center", angle: -10 });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(certData.companyName.toUpperCase(), pageWidth / 2, 80, { align: "center" });

    doc.setFontSize(32);
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    let title = "";
    switch (type) {
      case "program":
        title = "Certificate of Excellence";
        break;
      case "participation":
        title = "Certificate of Participation";
        break;
      case "internship":
        title = "Internship Certificate";
        break;
      default:
        title = "Certificate";
    }
    doc.text(title, pageWidth / 2, 100, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(156, 163, 175);
    doc.text("This is to certify that", pageWidth / 2, 120, { align: "center" });

    doc.setFontSize(28);
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(certData.recipientName.toUpperCase(), pageWidth / 2, 135, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);

    if (type === "program") {
      doc.text("has successfully completed the program in", pageWidth / 2, 150, { align: "center" });
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(certData.courseName.toUpperCase(), pageWidth / 2, 165, { align: "center" });
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text(`Duration: ${certData.startDate} to ${certData.endDate}`, pageWidth / 2, 180, { align: "center" });
    } else if (type === "participation") {
      doc.text("has actively participated in the event", pageWidth / 2, 150, { align: "center" });
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(`${certData.courseName.toUpperCase()} BOOTCAMP`, pageWidth / 2, 165, { align: "center" });
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text(`Duration: ${certData.startDate} to ${certData.endDate}`, pageWidth / 2, 180, { align: "center" });
    } else if (type === "internship") {
      doc.text("has successfully completed internship as", pageWidth / 2, 150, { align: "center" });
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(`${certData.courseName.toUpperCase()} INTERN`, pageWidth / 2, 165, { align: "center" });
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175);
      doc.text(`Duration: ${certData.startDate} to ${certData.endDate}`, pageWidth / 2, 180, { align: "center" });
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(certData.credentials, pageWidth / 2, 195, { align: "center", maxWidth: 150 });

    doc.setFontSize(12);
    doc.text(`Issued Date: ${certData.endDate}`, 40, pageHeight - 40);
    doc.text(`Certificate ID: ${certData.certificateId}`, pageWidth - 40, pageHeight - 40, { align: "right" });

    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, pageHeight - 50, pageWidth / 2 + 40, pageHeight - 50);

    doc.setFontSize(12);
    doc.setTextColor(156, 163, 175);
    doc.text("Program Director", pageWidth / 2, pageHeight - 45, { align: "center" });

    doc.setFontSize(11);
    doc.text(certData.programDirector, pageWidth / 2, pageHeight - 55, { align: "center" });

    doc.save(`${certData.recipientName}_${type}_Certificate.pdf`);
    showAlert("Certificate downloaded successfully!", "success");
  };

  const renderCertificates = () => {
    if (
      certificates.pCertificates.length === 0 &&
      certificates.iCertificates.length === 0 &&
      certificates.cCertificates.length === 0
    ) {
      return (
        <>
          <CertificateCard
            data={programCertificateData}
            type="program"
            onDownload={() =>
              generateCertificate(programCertificateData, "program")
            }
          />
          <CertificateCard
            data={participationCertificateData}
            type="participation"
            onDownload={() =>
              generateCertificate(participationCertificateData, "participation")
            }
          />
          <CertificateCard
            data={internshipCertificateData}
            type="internship"
            onDownload={() =>
              generateCertificate(internshipCertificateData, "internship")
            }
          />
        </>
      );
    } else {
      return (
        <>
          {certificates.pCertificates.map((cert, index) => (
            <CertificateCard
              key={index}
              data={{
                companyName: "WorldsAiBot",
                recipientName: cert.name,
                courseName: cert.courseName || cert.programName,
                startDate: cert.startDate,
                endDate: cert.endDate,
                certificateId: `WAB-2023-PY-00${index + 1}`,
                programDirector: "N.Prasanth Kumar",
                credentials:
                  "This e-certificate validates the successful completion of the program, including practical projects and assessments.",
              }}
              type="program"
              onDownload={() =>
                generateCertificate(
                  {
                    companyName: "WorldsAiBot",
                    recipientName: cert.name,
                    courseName: cert.courseName || cert.programName,
                    startDate: cert.startDate,
                    endDate: cert.endDate,
                    certificateId: `WAB-2023-PY-00${index + 1}`,
                    programDirector: "N.Prasanth Kumar",
                    credentials:
                      "This e-certificate validates the successful completion of the program, including practical projects and assessments.",
                  },
                  "program"
                )
              }
            />
          ))}
          {certificates.iCertificates.map((cert, index) => (
            <CertificateCard
              key={index}
              data={{
                companyName: "WorldsAiBot",
                recipientName: cert.name,
                courseName: cert.courseName || cert.programName,
                startDate: cert.startDate,
                endDate: cert.endDate,
                certificateId: `WAB-2023-IN-00${index + 1}`,
                programDirector: "N.Prasanth Kumar",
                credentials:
                  "This e-certificate is awarded for successfully completing the internship program.",
              }}
              type="internship"
              onDownload={() =>
                generateCertificate(
                  {
                    companyName: "WorldsAiBot",
                    recipientName: cert.name,
                    courseName: cert.courseName || cert.programName,
                    startDate: cert.startDate,
                    endDate: cert.endDate,
                    certificateId: `WAB-2023-IN-00${index + 1}`,
                    programDirector: "N.Prasanth Kumar",
                    credentials:
                      "This e-certificate is awarded for successfully completing the internship program.",
                  },
                  "internship"
                )
              }
            />
          ))}
          {certificates.cCertificates.map((cert, index) => (
            <CertificateCard
              key={index}
              data={{
                companyName: "WorldsAiBot",
                recipientName: cert.name,
                courseName: cert.courseName || cert.eventName,
                startDate: cert.startDate,
                endDate: cert.endDate,
                certificateId: `WAB-2023-BT-00${index + 1}`,
                programDirector: "N.Prasanth Kumar",
                credentials:
                  "This e-certificate is awarded for active participation in the event.",
              }}
              type="participation"
              onDownload={() =>
                generateCertificate(
                  {
                    companyName: "WorldsAiBot",
                    recipientName: cert.name,
                    courseName: cert.courseName || cert.eventName,
                    startDate: cert.startDate,
                    endDate: cert.endDate,
                    certificateId: `WAB-2023-BT-00${index + 1}`,
                    programDirector: "N.Prasanth Kumar",
                    credentials:
                      "This e-certificate is awarded for active participation in the event.",
                  },
                  "participation"
                )
              }
            />
          ))}
        </>
      );
    }
  };

  return (
    <div className="p-2 h-full bg-gray-950 overflow-y-auto pb-[130px] md:pb-0">
      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed top-[90px] left-1/2 -translate-x-1/2 sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:translate-x-0 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[100] ${
            alert.type === 'success'
              ? 'bg-green-600'
              : alert.type === 'info'
              ? 'bg-blue-600'
              : 'bg-red-600'
          } flex flex-col w-80 ${alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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

      <h2 className="text-3xl font-semibold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Your Certificates
      </h2>
      <div className="grid md:grid-cols-3 gap-6">{renderCertificates()}</div>
    </div>
  );
}

export default Awards;