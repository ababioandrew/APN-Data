import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./MembersDashboard.css";

// --------------------------------------------------
// CONFIGURATION (MOCKOON & BACKEND)
// --------------------------------------------------

const API_BASE_URL = (
  process.env.REACT_APP_MOCKOON_BASE_URL ||
  "https://playground.mockoon.com"
).replace(/\/+$/, "");

const API = {
  // Point to your Express backend, NOT JSONBin directly
  members: `/api/members`, 
  expenses: `${API_BASE_URL}/expenses`,
  announcements: `${API_BASE_URL}/announcements`,
  enquiries: `${API_BASE_URL}/posts`,
};

// --------------------------------------------------
// REUSABLE API HELPER
// --------------------------------------------------

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? data.message || data.error
        : data;
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return data;
}

// --------------------------------------------------
// DATA NORMALIZERS
// --------------------------------------------------

function normalizeMember(member) {
  return {
    id: member.id || Date.now().toString(),
    fullName: member.fullName || member.name || "",
    gender: member.gender || "",
    location: member.location || "",
    dateOfBirth: member.dateOfBirth || "",
    dateOfEntry: member.dateOfEntry || "",
    contacts: member.contacts || member.phone || "",
    email: member.email || "",
    remarks: member.remarks || "",
  };
}

function getRecords(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.expenses)) return data.expenses;
  if (Array.isArray(data?.announcements)) return data.announcements;
  return [];
}

const emptyMember = {
  fullName: "",
  gender: "",
  location: "",
  dateOfBirth: "",
  dateOfEntry: "",
  contacts: "",
  email: "",
  remarks: "",
};

const emptyExpense = {
  title: "",
  amount: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

const emptyAnnouncement = {
  title: "",
  message: "",
  date: new Date().toISOString().slice(0, 10),
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function MembersDashboard() {
  const [activeTab, setActiveTab] = useState("members");

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [memberForm, setMemberForm] = useState(emptyMember);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);

  const [editingMember, setEditingMember] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Checking...");

  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  // ------------------------------------------------
  // ALERT HELPER
  // ------------------------------------------------
  const showAlert = (icon, title, text) => {
    return Swal.fire({
      icon,
      title,
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  // ------------------------------------------------
  // LOAD MEMBERS (From Express Backend)
  // ------------------------------------------------
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch from backend. It handles JSONBin securely.
      const data = await fetchJSON(API.members);
      
      // The backend returns: { record: { members: [...] } }
      const records = data?.record?.members || data?.record || [];
      
      setMembers(records.map(normalizeMember));
      setBackendStatus("Connected (Cloud)");
    } catch (error) {
      console.error("Members loading error:", error);
      setBackendStatus("Connection failed");
      showAlert("error", "Unable to Load Members", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------
  // LOAD EXPENSES / ANNOUNCEMENTS (Mockoon)
  // ------------------------------------------------
  const fetchExpenses = useCallback(async () => {
    try {
      const data = await fetchJSON(API.expenses);
      setExpenses(getRecords(data));
    } catch (error) {
      setExpenses([]);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await fetchJSON(API.announcements);
      setAnnouncements(getRecords(data));
    } catch (error) {
      setAnnouncements([]);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchExpenses();
    fetchAnnouncements();
  }, [fetchMembers, fetchExpenses, fetchAnnouncements]);

  // ------------------------------------------------
  // SAVE TO CLOUD HELPER
  // ------------------------------------------------
  const saveMembersToCloud = async (updatedMembers) => {
    const payload = { members: updatedMembers };
    
    // Send PUT request to Express backend
    await fetchJSON(API.members, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  // ------------------------------------------------
  // MEMBER FORM HANDLING
  // ------------------------------------------------
  const handleMemberChange = (event) => {
    const { name, value } = event.target;
    setMemberForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetMemberForm = () => {
    setMemberForm(emptyMember);
    setEditingMember(null);
  };

  const handleEditMember = (member) => {
    setEditingMember(member.id);
    setMemberForm({ ...emptyMember, ...member });
    setActiveTab("members");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------
  // ADD / UPDATE MEMBER
  // ------------------------------------------------
  const handleSaveMember = async (event) => {
    event.preventDefault();

    if (!memberForm.fullName.trim()) {
      return showAlert("warning", "Missing Information", "Please enter the member's full name.");
    }

    try {
      setSaving(true);
      let updatedList = [];

      if (editingMember) {
        updatedList = members.map((m) =>
          m.id === editingMember ? { ...m, ...memberForm } : m
        );
      } else {
        const newMember = { ...memberForm, id: Date.now().toString() };
        updatedList = [...members, newMember];
      }

      await saveMembersToCloud(updatedList);
      
      setMembers(updatedList);
      resetMemberForm();
      showAlert("success", editingMember ? "Member Updated" : "Member Added", "Saved to cloud successfully!");

    } catch (error) {
      console.error("Save error:", error);
      showAlert("error", "Save Failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // DELETE MEMBER
  // ------------------------------------------------
  const handleDeleteMember = async (member) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete Member?",
      text: `Are you sure you want to delete ${member.fullName}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!confirmation.isConfirmed) return;

    try {
      setSaving(true);
      const updatedList = members.filter((m) => m.id !== member.id);
      
      await saveMembersToCloud(updatedList);
      
      setMembers(updatedList);
      showAlert("success", "Member Deleted", "Removed from cloud successfully.");
    } catch (error) {
      showAlert("error", "Delete Failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // EXPENSE FORM
  // ------------------------------------------------
  const handleExpenseChange = (event) => {
    const { name, value } = event.target;
    setExpenseForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveExpense = async (event) => {
    event.preventDefault();
    if (!expenseForm.title.trim() || expenseForm.amount === "" || Number(expenseForm.amount) <= 0) {
      return showAlert("warning", "Invalid Expense", "Enter an expense title and a valid amount.");
    }

    try {
      setSaving(true);
      await fetchJSON(API.expenses, {
        method: "POST",
        body: JSON.stringify({ ...expenseForm, amount: Number(expenseForm.amount) }),
      });
      await fetchExpenses();
      setExpenseForm(emptyExpense);
      showAlert("success", "Expense Saved", "The expense was submitted successfully.");
    } catch (error) {
      showAlert("error", "Unable to Save Expense", error.message);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // ANNOUNCEMENT FORM
  // ------------------------------------------------
  const handleAnnouncementChange = (event) => {
    const { name, value } = event.target;
    setAnnouncementForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSaveAnnouncement = async (event) => {
    event.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      return showAlert("warning", "Missing Information", "Enter an announcement title and message.");
    }

    try {
      setSaving(true);
      await fetchJSON(API.announcements, {
        method: "POST",
        body: JSON.stringify(announcementForm),
      });
      await fetchAnnouncements();
      setAnnouncementForm(emptyAnnouncement);
      showAlert("success", "Announcement Published", "Your announcement was submitted successfully.");
    } catch (error) {
      showAlert("error", "Unable to Publish Announcement", error.message);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // ENQUIRY FORM
  // ------------------------------------------------
  const handleEnquiryChange = (event) => {
    const { name, value } = event.target;
    setEnquiry((previous) => ({ ...previous, [name]: value }));
  };

  const handleSendEnquiry = async (event) => {
    event.preventDefault();
    if (!enquiry.name.trim() || !enquiry.message.trim()) {
      return showAlert("warning", "Missing Information", "Please enter your name and message.");
    }

    try {
      setSendingEnquiry(true);
      await fetchJSON(API.enquiries, {
        method: "POST",
        body: JSON.stringify(enquiry),
      });

      const whatsappMessage = [
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email || "Not provided"}`,
        `Message: ${enquiry.message}`,
      ].join("\n");

      window.open(`https://wa.me/233548099730?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
      setEnquiry({ name: "", email: "", message: "" });
      showAlert("success", "Enquiry Submitted", "Your enquiry was submitted successfully.");
    } catch (error) {
      showAlert("error", "Unable to Submit Enquiry", error.message);
    } finally {
      setSendingEnquiry(false);
    }
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div className="members-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Church Administration</h1>
          <p>Manage members, expenses and announcements.</p>
        </div>
        <div className="backend-status">
          <span className={backendStatus.includes("Connected") ? "status-connected" : "status-disconnected"}>
            ● {backendStatus}
          </span>
          <button type="button" onClick={fetchMembers}>Refresh</button>
        </div>
      </header>

      <nav className="dashboard-tabs">
        {[["members", "Members"], ["expenses", "Expenses"], ["announcements", "Announcements"], ["enquiries", "Enquiries"]].map(([key, label]) => (
          <button key={key} type="button" className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "members" && (
        <section className="dashboard-section">
          <h2>{editingMember ? "Update Member Details" : "Register New Member"}</h2>
          
          <form onSubmit={handleSaveMember} className="dashboard-form">
            <label>Full Name *</label>
            <input type="text" name="fullName" value={memberForm.fullName} onChange={handleMemberChange} placeholder="Enter full name" required />

            <label>Gender</label>
            <select name="gender" value={memberForm.gender} onChange={handleMemberChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label>Location / Residential Address</label>
            <input type="text" name="location" value={memberForm.location} onChange={handleMemberChange} placeholder="Enter residential address" />

            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={memberForm.dateOfBirth} onChange={handleMemberChange} />

            <label>Date of Entry / Joining Date</label>
            <input type="date" name="dateOfEntry" value={memberForm.dateOfEntry} onChange={handleMemberChange} />

            <label>Contact Number</label>
            <input type="tel" name="contacts" value={memberForm.contacts} onChange={handleMemberChange} placeholder="Enter contact number" />

            <label>Email Address</label>
            <input type="email" name="email" value={memberForm.email} onChange={handleMemberChange} placeholder="Enter email address" />

            <label>Remarks / Additional Information</label>
            <textarea name="remarks" value={memberForm.remarks} onChange={handleMemberChange} placeholder="Enter additional information" rows="4" />

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Saving to Cloud..." : editingMember ? "Update Member" : "Register Member"}
              </button>
              <button type="button" className="secondary-button" onClick={resetMemberForm}>
                {editingMember ? "Cancel Update" : "Clear Form"}
              </button>
            </div>
          </form>

          <h2>Registered Members ({members.length})</h2>

          {loading ? (
            <p>Loading members from cloud...</p>
          ) : members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Gender</th>
                    <th>Location</th>
                    <th>Date of Birth</th>
                    <th>Date of Entry</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.fullName}</td>
                      <td>{member.gender || "—"}</td>
                      <td>{member.location || "—"}</td>
                      <td>{member.dateOfBirth || "—"}</td>
                      <td>{member.dateOfEntry || "—"}</td>
                      <td>{member.contacts || "—"}</td>
                      <td>{member.email || "—"}</td>
                      <td>{member.remarks || "—"}</td>
                      <td className="table-actions">
                        <button type="button" onClick={() => handleEditMember(member)}>Edit</button>
                        <button type="button" className="delete-button" onClick={() => handleDeleteMember(member)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "expenses" && (
        <section className="dashboard-section">
          <h2>Record Church Expense</h2>
          <form onSubmit={handleSaveExpense} className="dashboard-form">
            <input name="title" value={expenseForm.title} onChange={handleExpenseChange} placeholder="Expense title" required />
            <input type="number" min="0.01" step="0.01" name="amount" value={expenseForm.amount} onChange={handleExpenseChange} placeholder="Amount (GH₵)" required />
            <input name="category" value={expenseForm.category} onChange={handleExpenseChange} placeholder="Category" />
            <input type="date" name="date" value={expenseForm.date} onChange={handleExpenseChange} />
            <textarea name="description" value={expenseForm.description} onChange={handleExpenseChange} placeholder="Description" rows="3" />
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Expense"}</button>
          </form>
          <h2>Expenses ({expenses.length})</h2>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th></tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={expense.id || index}>
                    <td>{expense.title || "—"}</td><td>{expense.category || "—"}</td>
                    <td>GH₵ {Number(expense.amount || 0).toFixed(2)}</td>
                    <td>{expense.date || "—"}</td><td>{expense.description || "—"}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan="5">No expenses found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "announcements" && (
        <section className="dashboard-section">
          <h2>Create Announcement</h2>
          <form onSubmit={handleSaveAnnouncement} className="dashboard-form">
            <input name="title" value={announcementForm.title} onChange={handleAnnouncementChange} placeholder="Announcement title" required />
            <textarea name="message" value={announcementForm.message} onChange={handleAnnouncementChange} placeholder="Announcement message" rows="5" required />
            <input type="date" name="date" value={announcementForm.date} onChange={handleAnnouncementChange} />
            <button type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish Announcement"}</button>
          </form>
          <h2>Announcements ({announcements.length})</h2>
          <div className="announcement-list">
            {announcements.map((announcement, index) => (
              <article className="announcement-card" key={announcement.id || index}>
                <h3>{announcement.title}</h3>
                <p>{announcement.message}</p>
                <small>{announcement.date || ""}</small>
              </article>
            ))}
            {announcements.length === 0 && <p>No announcements found.</p>}
          </div>
        </section>
      )}

      {activeTab === "enquiries" && (
        <section className="dashboard-section">
          <h2>Submit an Enquiry</h2>
          <form onSubmit={handleSendEnquiry} className="dashboard-form">
            <input name="name" value={enquiry.name} onChange={handleEnquiryChange} placeholder="Your name" required />
            <input type="email" name="email" value={enquiry.email} onChange={handleEnquiryChange} placeholder="Your email address" />
            <textarea name="message" value={enquiry.message} onChange={handleEnquiryChange} placeholder="Your message" rows="5" required />
            <button type="submit" disabled={sendingEnquiry}>{sendingEnquiry ? "Submitting..." : "Submit Enquiry"}</button>
          </form>
        </section>
      )}
    </div>
  );
}