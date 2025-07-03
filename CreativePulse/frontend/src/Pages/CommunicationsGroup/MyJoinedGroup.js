import React, { useEffect, useState } from 'react';
import { FaUsers, FaUserShield, FaSignInAlt } from 'react-icons/fa';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

function MyJoinedGroup() {
  const [groups, setGroups] = useState([]);
  const userId = localStorage.getItem('userID');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/communications')
      .then((response) => response.json())
      .then((data) => {
        // Filter groups where userId is in groupMembersIDs or adminID === userId
        const joinedGroups = data.filter(
          (group) =>
            (Array.isArray(group.groupMembersIDs) &&
              group.groupMembersIDs.includes(userId)) ||
            group.adminID === userId
        );
        setGroups(joinedGroups);
      })
      .catch((error) => console.error('Error fetching group data:', error));
  }, [userId]);

  return (
    <div>
      <NavBar />
      <br /><br /><br />
      <div className="groups-container">
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
              boxShadow: '0 4px 8px rgba(66, 133, 244, 0.3)'
            }}
          >
            My Joined Group
          </button>
        </div>
        {groups.length === 0 ? (
          <div className="no-groups-message">
            <p>No Join Group Plz Join group</p>
          </div>
        ) : (
          <div className="groups-list">
            {groups.map((group) => (
              <div key={group.id} className="group-card-full">
                <div className="group-content">
                  <div className="group-header">
                    <h3 className="group-title">{group.groupTitle}</h3>
                    <p className="group-description">{group.groupDescription}</p>
                  </div>
                  <div className="group-meta">
                    <div className="meta-item">
                      <FaUsers className="meta-icon" />
                      <span>
                        {Array.isArray(group.groupMembersIDs) ? group.groupMembersIDs.length : 0} members
                      </span>
                    </div>
                    <div className="meta-item">
                      <FaUserShield className="meta-icon" />
                      <span>Created by {group.adminName}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="join-btn"
                  onClick={() => navigate(`/groupChat/${group.id}`)}
                >
                  View Group
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <br />
    </div>
  );
}

export default MyJoinedGroup;
