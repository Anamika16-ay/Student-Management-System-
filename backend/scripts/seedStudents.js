/**
 * seedStudents.js
 * ----------------
 * Bulk-inserts ~60 sample students into MongoDB for testing/demo.
 *
 * Usage:
 *   node scripts/seedStudents.js          -> adds 60 students
 *   node scripts/seedStudents.js --clear  -> deletes ALL students first, then adds 60
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna',
  'Ishaan', 'Rohan', 'Kabir', 'Aryan', 'Dhruv', 'Karan', 'Rudra', 'Yash',
  'Priya', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra', 'Sara',
  'Ira', 'Anika', 'Navya', 'Riya', 'Pari', 'Aarohi', 'Meera', 'Tara',
  'Rahul', 'Amit', 'Suresh', 'Vikram', 'Manish', 'Deepak', 'Sanjay', 'Nikhil',
  'Pooja', 'Neha', 'Kavya', 'Simran', 'Anjali', 'Divya', 'Sneha', 'Preeti',
  'Rajesh', 'Vijay', 'Ashok', 'Ramesh', 'Sunil', 'Anil', 'Mohit', 'Gaurav',
  'Shreya', 'Nisha', 'Payal', 'Komal',
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Yadav', 'Mishra', 'Tiwari',
  'Pandey', 'Agarwal', 'Jain', 'Chauhan', 'Rathore', 'Reddy', 'Nair', 'Iyer',
  'Joshi', 'Malhotra', 'Kapoor', 'Chopra',
];

const courses = [
  'B.Tech CSE', 'B.Tech ECE', 'B.Tech Mechanical', 'B.Tech Civil',
  'B.Tech IT', 'BCA', 'MCA', 'B.Sc Computer Science',
];

const departments = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil',
  'Information Technology', 'Electrical',
];

const genders = ['male', 'female', 'other'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return '+91' + Math.floor(6000000000 + Math.random() * 3999999999);
}

function randomDOB() {
  const year = 2000 + Math.floor(Math.random() * 6); // 2000-2005
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateStudents(count) {
  const students = [];
  for (let i = 1; i <= count; i++) {
    const first = randomFrom(firstNames);
    const last = randomFrom(lastNames);
    students.push({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`, // index keeps emails unique
      phone: randomPhone(),
      course: randomFrom(courses),
      semester: 1 + Math.floor(Math.random() * 8),
      department: randomFrom(departments),
      address: 'Lucknow, Uttar Pradesh',
      dateOfBirth: randomDOB(),
      gender: randomFrom(genders),
    });
  }
  return students;
}

async function seed() {
  const shouldClear = process.argv.includes('--clear');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  if (shouldClear) {
    await Student.deleteMany({});
    console.log('Existing students cleared.');
  }

  const students = generateStudents(60);

  try {
    const result = await Student.insertMany(students, { ordered: false });
    console.log(`Successfully inserted ${result.length} students.`);
  } catch (err) {
    // ordered:false continues past duplicate-key errors; report how many succeeded.
    const inserted = err.insertedDocs ? err.insertedDocs.length : 0;
    console.log(`Inserted ${inserted} students (some may have been skipped due to duplicate emails).`);
  }

  await mongoose.connection.close();
  console.log('Done. Connection closed.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});