import { Student } from '../../interfaces/user'
import { fetchStudentProfile, updateStudentProfile } from '../../redux/slice/studentSlice'
import { AppDispatch, RootState } from '../../redux/store'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { student, loading, error, isSuccess, message } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    mobile: '',
    language: '',
    profileImage: ''
  })
  const [editMode, setEditMode] = useState(false);

  const studentId = student?._id || ''

  useEffect(() => {
    if (studentId) {
      dispatch(fetchStudentProfile(studentId))
    }
  }, [studentId, dispatch])

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        mobile: student.mobile || '',
        language: student.language || '',
        profileImage: student.profileImage || ''
      })
    }
  }, [student])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          profileImage: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId) {
      dispatch(updateStudentProfile({ studentId, formData }));
      setEditMode(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="student-profile">
      <h2>Student Profile</h2>
      
      {error && <div className="error">{error}</div>}
      {isSuccess && message && <div className="success">{message}</div>}

      {!editMode ? (
        <div>
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Mobile:</strong> {formData.mobile}</p>
          <p><strong>Language:</strong> {formData.language}</p>
          {formData.profileImage && (
            <img src={formData.profileImage} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
          )}
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile</label>
            <input type="text" id="mobile" name="mobile" value={formData.mobile || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <input type="text" id="language" name="language" value={formData.language || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="profileImage">Profile Image</label>
            <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleFileChange} />
            {formData.profileImage && (
              <img src={formData.profileImage} alt="Profile" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
            )}
          </div>

          <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</button>
          <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
