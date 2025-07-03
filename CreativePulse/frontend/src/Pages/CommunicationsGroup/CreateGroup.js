import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';

function CreateGroup() {
  const [formData, setFormData] = useState({
    groupTitle: '',
    groupDescription: '',
    adminID: '',
    adminName: ''
  });

  useEffect(() => {
    // Fetch adminID from localStorage
    const userID = localStorage.getItem('userID');
    if (userID) {
      // Fetch adminName from backend
      fetch(`http://localhost:8080/user/${userID}/fullname`)
        .then(res => res.json())
        .then(data => {
          setFormData(prev => ({
            ...prev,
            adminID: userID,
            adminName: data.fullName || ''
          }));
        })
        .catch(() => {
          setFormData(prev => ({
            ...prev,
            adminID: userID,
            adminName: ''
          }));
        });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Group created successfully!');
        window.location.href = '/myGroup';
      } else {
        let errorMessage = 'This group title already exists. Please enter a new name.';
        try {
          const errorData = await response.json();
          if (errorData.message === 'Group title already exists.') {
            errorMessage = 'This group title already exists. Please enter a new name.';
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch {
          if (response.status === 400) {
            errorMessage = 'This group title already exists. Please enter a new name.';
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred.');
    }
  };

  return (
    <div>
      <NavBar />
      <br /><br /><br />
      <div className="create-group-container">
        <h2>Create Group</h2>
        <form className="create-group-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Title</label>
            <input
              name="groupTitle"
              placeholder="Enter group title"
              value={formData.groupTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Group Description</label>
            <textarea
              name="groupDescription"
              placeholder="Enter group description"
              value={formData.groupDescription}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>
          <button type="submit" className="submit-btn">Create Group</button>
        </form>
      </div>
      <br />
    </div>
  );
}

export default CreateGroup;