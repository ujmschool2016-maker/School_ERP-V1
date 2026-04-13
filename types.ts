
export interface Student {
  id: string;
  roll: string;
  name: string;
  fatherName: string;
  motherName: string;
  address: string;
  mobile: string;
  dob: string;
  className: string;
  photo?: string;
}

export interface Teacher {
  id: string;
  name: string;
  fatherName: string;
  address: string;
  mobile: string;
  dob: string;
  designation: string;
  joiningDate: string;
  baseSalary: number;
  photo?: string;
}

export interface ClassRates {
  className: string;
  admissionFee: number;
  tuitionFee: number;
  examFee: number;
  sessionFee: number;
  registrationFee: number;
}

export interface AttendanceRecord {
  id: string;
  entityId: string;
  entityName: string;
  type: 'Student' | 'Teacher';
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  time: string;
  className?: string;
}

export interface FeeRecord {
  id: string;
  studentRoll: string;
  month: string;
  admissionFee: number;
  registrationFee: number;
  idCardDiaryFee: number;
  sessionFee: number;
  tuitionFee: number;
  examFee: number;
  culturalSportsFee: number;
  scholarshipExamFee: number;
  othersFee: number;
  previousDue: number; 
  total: number;
  paidAmount: number;
  dueAmount: number;
}

export interface Result {
  id: string;
  studentRoll: string;
  className: string;
  examType: '1st' | '2nd' | '3rd' | 'Annual';
  subject: string;
  marks: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export interface LeaveRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  type: 'Student' | 'Teacher';
  category: 'Sick' | 'Personal' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface SalaryRecord {
  id: string;
  teacherId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  total: number;
  paymentDate: string;
  status: 'Paid' | 'Pending';
}

export type OperationCategory = 
  | 'Utility' 
  | 'Rent' 
  | 'Maintenance' 
  | 'Events' 
  | 'Supplies' 
  | 'Home' 
  | 'Others'
  | 'Result published'
  | 'Class 5 Farewell Ceremony'
  | 'Student Awards'
  | 'Anual Sports Program'
  | 'Stydy Tour (Picnic)';

export interface OperationCost {
  id: string;
  category: OperationCategory;
  description: string;
  amount: number;
  date: string;
}

export interface DashboardStats {
  totalStudents: number;
  studentsOnLeave: number;
  totalTeachers: number;
  teachersOnLeave: number;
  totalRevenue: number;
  totalExpenses: number;
  totalDueFees: number;
  totalDueSalaries: number;
  passRate: number;
  attendanceToday: {
    present: number;
    absent: number;
    total: number;
  };
  feeTrends: { month: string; amount: number }[];
}
