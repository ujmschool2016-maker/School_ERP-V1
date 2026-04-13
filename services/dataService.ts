
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { Student, Teacher, FeeRecord, Result, DashboardStats, LeaveRequest, SalaryRecord, OperationCost, AttendanceRecord, ClassRates } from '../types';

const COLLECTIONS = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  FEES: 'fees',
  RESULTS: 'results',
  LEAVES: 'leaves',
  SALARIES: 'salaries',
  COSTS: 'costs',
  ATTENDANCE: 'attendance',
  RATES: 'rates'
};

export const dataService = {
  // Real-time listeners
  subscribeToStudents: (callback: (students: Student[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.STUDENTS), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.STUDENTS));
  },

  subscribeToTeachers: (callback: (teachers: Teacher[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.TEACHERS), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Teacher)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.TEACHERS));
  },

  subscribeToAttendance: (callback: (records: AttendanceRecord[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.ATTENDANCE), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ATTENDANCE));
  },

  subscribeToFees: (callback: (fees: FeeRecord[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.FEES), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeeRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.FEES));
  },

  subscribeToResults: (callback: (results: Result[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.RESULTS), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Result)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.RESULTS));
  },

  subscribeToLeaves: (callback: (leaves: LeaveRequest[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.LEAVES), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeaveRequest)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LEAVES));
  },

  subscribeToSalaries: (callback: (salaries: SalaryRecord[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.SALARIES), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SalaryRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SALARIES));
  },

  subscribeToCosts: (callback: (costs: OperationCost[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.COSTS), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as OperationCost)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.COSTS));
  },

  subscribeToRates: (callback: (rates: ClassRates[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.RATES), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ ...doc.data() } as ClassRates)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, COLLECTIONS.RATES));
  },

  // Async methods
  getRates: async (): Promise<ClassRates[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.RATES));
      return snapshot.docs.map(doc => doc.data() as ClassRates);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.RATES);
      return [];
    }
  },
  saveRates: async (rates: ClassRates[]) => {
    try {
      for (const rate of rates) {
        await setDoc(doc(db, COLLECTIONS.RATES, rate.className), rate);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.RATES);
    }
  },

  getStudents: async (): Promise<Student[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.STUDENTS);
      return [];
    }
  },
  saveStudent: async (student: Omit<Student, 'id'>) => {
    try {
      const id = Date.now().toString();
      const newStudent = { ...student, id };
      await setDoc(doc(db, COLLECTIONS.STUDENTS, id), newStudent);
      return newStudent;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.STUDENTS);
    }
  },
  updateStudent: async (student: Student) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.STUDENTS}/${student.id}`);
    }
  },
  deleteStudent: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.STUDENTS}/${id}`);
    }
  },

  getTeachers: async (): Promise<Teacher[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.TEACHERS));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Teacher));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.TEACHERS);
      return [];
    }
  },
  saveTeacher: async (teacher: Omit<Teacher, 'id'>) => {
    try {
      const id = Date.now().toString();
      const newTeacher = { ...teacher, id };
      await setDoc(doc(db, COLLECTIONS.TEACHERS, id), newTeacher);
      return newTeacher;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.TEACHERS);
    }
  },
  updateTeacher: async (teacher: Teacher) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), teacher as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.TEACHERS}/${teacher.id}`);
    }
  },

  getAttendance: async (): Promise<AttendanceRecord[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceRecord));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.ATTENDANCE);
      return [];
    }
  },
  markAttendance: async (record: Omit<AttendanceRecord, 'id' | 'time'>) => {
    try {
      const id = Date.now().toString();
      const time = new Date().toLocaleTimeString();
      const today = new Date().toISOString().split('T')[0];
      const newRecord = { ...record, id, time, date: today };
      await setDoc(doc(db, COLLECTIONS.ATTENDANCE, id), newRecord);
      return newRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.ATTENDANCE);
    }
  },

  getFees: async (): Promise<FeeRecord[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.FEES));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeeRecord));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.FEES);
      return [];
    }
  },
  saveFee: async (fee: Omit<FeeRecord, 'id'>) => {
    try {
      const id = Date.now().toString();
      const newFee = { ...fee, id };
      await setDoc(doc(db, COLLECTIONS.FEES, id), newFee);
      return newFee;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.FEES);
    }
  },

  getResults: async (): Promise<Result[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.RESULTS));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Result));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.RESULTS);
      return [];
    }
  },
  saveResult: async (result: Omit<Result, 'id' | 'grade' | 'status'>) => {
    try {
      const id = Date.now().toString();
      const m = result.marks;
      const status = m >= 33 ? 'Pass' : 'Fail';
      let grade = 'F';
      if (m >= 80) grade = 'A+';
      else if (m >= 70) grade = 'A';
      else if (m >= 60) grade = 'A-';
      else if (m >= 50) grade = 'B';
      else if (m >= 40) grade = 'C';
      else if (m >= 33) grade = 'D';

      const newResult = { ...result, id, status, grade } as Result;
      await setDoc(doc(db, COLLECTIONS.RESULTS, id), newResult);
      return newResult;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.RESULTS);
    }
  },
  updateResult: async (result: Result) => {
    try {
      const m = result.marks;
      const status = m >= 33 ? 'Pass' : 'Fail';
      let grade = 'F';
      if (m >= 80) grade = 'A+';
      else if (m >= 70) grade = 'A';
      else if (m >= 60) grade = 'A-';
      else if (m >= 50) grade = 'B';
      else if (m >= 40) grade = 'C';
      else if (m >= 33) grade = 'D';

      await updateDoc(doc(db, COLLECTIONS.RESULTS, result.id), { ...result, status, grade } as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.RESULTS}/${result.id}`);
    }
  },

  getLeaves: async (): Promise<LeaveRequest[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.LEAVES));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeaveRequest));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LEAVES);
      return [];
    }
  },
  saveLeave: async (leave: Omit<LeaveRequest, 'id'>) => {
    try {
      const id = Date.now().toString();
      const newLeave = { ...leave, id };
      await setDoc(doc(db, COLLECTIONS.LEAVES, id), newLeave);
      return newLeave;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.LEAVES);
    }
  },
  updateLeaveStatus: async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateDoc(doc(db, COLLECTIONS.LEAVES, id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.LEAVES}/${id}`);
    }
  },

  getSalaries: async (): Promise<SalaryRecord[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.SALARIES));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SalaryRecord));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SALARIES);
      return [];
    }
  },
  saveSalary: async (salary: Omit<SalaryRecord, 'id'>) => {
    try {
      const id = Date.now().toString();
      const newSalary = { ...salary, id };
      await setDoc(doc(db, COLLECTIONS.SALARIES, id), newSalary);
      return newSalary;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.SALARIES);
    }
  },

  getCosts: async (): Promise<OperationCost[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.COSTS));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as OperationCost));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.COSTS);
      return [];
    }
  },
  saveCost: async (cost: Omit<OperationCost, 'id'>) => {
    try {
      const id = Date.now().toString();
      const newCost = { ...cost, id };
      await setDoc(doc(db, COLLECTIONS.COSTS, id), newCost);
      return newCost;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.COSTS);
    }
  },
  updateCost: async (cost: OperationCost) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.COSTS, cost.id), cost as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.COSTS}/${cost.id}`);
    }
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const [students, teachers, fees, results, costs, salaries, leaves, attendance] = await Promise.all([
      dataService.getStudents(),
      dataService.getTeachers(),
      dataService.getFees(),
      dataService.getResults(),
      dataService.getCosts(),
      dataService.getSalaries(),
      dataService.getLeaves(),
      dataService.getAttendance()
    ]);

    const today = new Date().toISOString().split('T')[0];

    const totalRevenue = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const opCostsTotal = costs.reduce((acc, c) => acc + c.amount, 0);
    const salariesPaid = salaries.filter(s => s.status === 'Paid').reduce((acc, s) => acc + s.total, 0);
    const totalExpenses = opCostsTotal + salariesPaid;

    // Simplified balance calculation for dashboard
    const totalDueFees = fees.reduce((acc, f) => acc + f.dueAmount, 0);
    const totalDueSalaries = salaries.filter(s => s.status === 'Pending').reduce((acc, s) => acc + s.total, 0);

    const activeLeaves = leaves.filter(l => l.status === 'Approved' && today >= l.startDate && today <= l.endDate);
    const studentsOnLeave = activeLeaves.filter(l => l.type === 'Student').length;
    const teachersOnLeave = activeLeaves.filter(l => l.type === 'Teacher').length;

    const passCount = results.filter(r => r.status === 'Pass').length;
    const passRate = results.length > 0 ? (passCount / results.length) * 100 : 0;

    const todayAttendance = attendance.filter(a => a.date === today && a.type === 'Student');
    const presentCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const feeTrends = months.map(month => ({
      month,
      amount: fees.filter(f => f.month === month).reduce((acc, f) => acc + f.paidAmount, 0)
    }));

    return {
      totalStudents: students.length,
      studentsOnLeave,
      totalTeachers: teachers.length,
      teachersOnLeave,
      totalRevenue,
      totalExpenses,
      totalDueFees,
      totalDueSalaries,
      passRate,
      attendanceToday: {
        present: presentCount,
        absent: students.length - presentCount,
        total: students.length
      },
      feeTrends
    };
  }
};
;
