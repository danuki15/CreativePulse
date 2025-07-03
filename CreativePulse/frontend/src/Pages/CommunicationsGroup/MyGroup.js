import React, { useEffect, useState } from 'react';
import './group.css'
import { FaEdit, FaTrash, FaUserCog } from 'react-icons/fa';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
function MyGroup() {
  const [groups, setGroups] = useState([]);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/communications')
      .then((response) => response.json())
      .then((data) => setGroups(data))
      .catch((error) => console.error('Error fetching group data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        const response = await fetch(`http://localhost:8080/communications/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Group deleted successfully!');
          setGroups(groups.filter((group) => group.id !== id));
        } else {
          alert('Failed to delete group.');
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  return (
    <div>
      <NavBar />
      <br /><br /><br />
      <div className="dashboard-container">
        <div className='add_new_btn'
          onClick={() => (window.location.href = '/createGroup')}
          style={{
            backgroundColor: '#FF6F61',
            color: '#fff',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 0 20px auto',
            boxShadow: '0 4px 12px rgba(255, 111, 97, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#E64A45';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 14px rgba(255, 111, 97, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6F61';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 111, 97, 0.3)';
          }}
        >
          <IoIosCreate className='add_new_btn_icon' style={{ fontSize: '24px' }} />
        </div>
        <div className='filter-buttons' style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <button
            onClick={() => (window.location.href = '/groupList')}
            className="filter-btn"
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(66, 133, 244, 0.1)',
              color: '#4285F4',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            All Group
          </button>
          <button
            onClick={() => (window.location.href = '/myGroup')}
            className="filter-btn"
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(66, 133, 244, 0.1)',
              color: '#4285F4',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(66, 133, 244, 0.3)'
            }}
          >
            My Group
          </button>
          <button
            onClick={() => (window.location.href = '/myJoinedGroup')}
            className="filter-btn"
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(66, 133, 244, 0.1)',
              color: '#4285F4',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            My Joined Group
          </button>
        </div>
        {groups.filter(group => group.adminID === userId).length === 0 ? (
          <div className="empty-state">
            <FaUserCog className="empty-icon" />
            <p>No groups found. Please create a new group.</p>
          </div>
        ) : (
          <ul className="groups-list">
            {groups
              .filter(group => group.adminID === userId)
              .map((group) => (
                <li key={group.id} className="group-item">
                  <div className="group-content">
                    <div className="group-header">
                      <h3 className="group-title">{group.groupTitle}</h3>
                      <p className="group-description">{group.groupDescription}</p>
                    </div>
                    <div className="group-admin-info">
                      <span className="admin-name">Admin: {group.adminName}</span>
                      <span className="admin-id">ID: {group.adminID}</span>
                    </div>
                  </div>
                  <div className="group-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => (window.location.href = `/updateGroupDetails/${group.id}`)}
                    >
                      <FaEdit className="btn-icon" /> Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(group.id)}
                    >
                      <FaTrash className="btn-icon" /> Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
      <br />
    </div>
  );
}


export default MyGroup;
