
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
  writeBatch,
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
    console.log('Attempting to save student:', student);
    try {
      // Duplicate check: Roll and Class
      const q = query(
        collection(db, COLLECTIONS.STUDENTS),
        where('roll', '==', student.roll),
        where('className', '==', student.className)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Student with Roll ${student.roll} already exists in ${student.className}`);
      }

      const id = Date.now().toString();
      const newStudent = { ...student, id };
      await setDoc(doc(db, COLLECTIONS.STUDENTS, id), newStudent);
      console.log('Student saved successfully with ID:', id);
      return newStudent;
    } catch (error: any) {
      console.error('Error in saveStudent:', error);
      if (error.message.includes('already exists')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.STUDENTS);
    }
  },
  updateStudent: async (student: Student) => {
    try {
      // Duplicate check for update: Roll and Class (excluding current student)
      const q = query(
        collection(db, COLLECTIONS.STUDENTS),
        where('roll', '==', student.roll),
        where('className', '==', student.className)
      );
      const snapshot = await getDocs(q);
      const duplicate = snapshot.docs.find(doc => doc.id !== student.id);
      if (duplicate) {
        throw new Error(`Another student with Roll ${student.roll} already exists in ${student.className}`);
      }

      await updateDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student as any);
    } catch (error: any) {
      if (error.message.includes('already exists')) throw error;
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
      // Duplicate check: Mobile
      const q = query(collection(db, COLLECTIONS.TEACHERS), where('mobile', '==', teacher.mobile));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Teacher with mobile ${teacher.mobile} is already registered`);
      }

      const id = Date.now().toString();
      const newTeacher = { ...teacher, id };
      await setDoc(doc(db, COLLECTIONS.TEACHERS, id), newTeacher);
      return newTeacher;
    } catch (error: any) {
      if (error.message.includes('already registered')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.TEACHERS);
    }
  },
  updateTeacher: async (teacher: Teacher) => {
    try {
      // Duplicate check for update: Mobile (excluding current teacher)
      const q = query(collection(db, COLLECTIONS.TEACHERS), where('mobile', '==', teacher.mobile));
      const snapshot = await getDocs(q);
      const duplicate = snapshot.docs.find(doc => doc.id !== teacher.id);
      if (duplicate) {
        throw new Error(`Another teacher with mobile ${teacher.mobile} is already registered`);
      }

      await updateDoc(doc(db, COLLECTIONS.TEACHERS, teacher.id), teacher as any);
    } catch (error: any) {
      if (error.message.includes('already registered')) throw error;
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.TEACHERS}/${teacher.id}`);
    }
  },
  deleteTeacher: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TEACHERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.TEACHERS}/${id}`);
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
      const today = new Date().toISOString().split('T')[0];
      
      // Duplicate check: Entity, Type, and Date
      const q = query(
        collection(db, COLLECTIONS.ATTENDANCE),
        where('entityId', '==', record.entityId),
        where('type', '==', record.type),
        where('date', '==', today)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Attendance already marked for today`);
      }

      const id = Date.now().toString();
      const time = new Date().toLocaleTimeString();
      const newRecord = { ...record, id, time, date: today };
      await setDoc(doc(db, COLLECTIONS.ATTENDANCE, id), newRecord);
      return newRecord;
    } catch (error: any) {
      if (error.message.includes('already marked')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.ATTENDANCE);
    }
  },
  deleteAttendance: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.ATTENDANCE, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.ATTENDANCE}/${id}`);
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
      // Duplicate check: Student and Month
      const q = query(
        collection(db, COLLECTIONS.FEES),
        where('studentRoll', '==', fee.studentRoll),
        where('month', '==', fee.month)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Fees for ${fee.month} already recorded for this student`);
      }

      const id = Date.now().toString();
      const newFee = { ...fee, id };
      await setDoc(doc(db, COLLECTIONS.FEES, id), newFee);
      return newFee;
    } catch (error: any) {
      if (error.message.includes('already recorded')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.FEES);
    }
  },
  deleteFee: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.FEES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.FEES}/${id}`);
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
      // Duplicate check: Student, Exam, and Subject
      const q = query(
        collection(db, COLLECTIONS.RESULTS),
        where('studentRoll', '==', result.studentRoll),
        where('examType', '==', result.examType),
        where('subject', '==', result.subject)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Result for this subject and exam already exists`);
      }

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
    } catch (error: any) {
      if (error.message.includes('already exists')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.RESULTS);
    }
  },
  updateResult: async (result: Result) => {
    try {
      // Duplicate check for update
      const q = query(
        collection(db, COLLECTIONS.RESULTS),
        where('studentRoll', '==', result.studentRoll),
        where('examType', '==', result.examType),
        where('subject', '==', result.subject)
      );
      const snapshot = await getDocs(q);
      const duplicate = snapshot.docs.find(doc => doc.id !== result.id);
      if (duplicate) {
        throw new Error(`Another result for this subject and exam already exists`);
      }

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
    } catch (error: any) {
      if (error.message.includes('already exists')) throw error;
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.RESULTS}/${result.id}`);
    }
  },
  deleteResult: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.RESULTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.RESULTS}/${id}`);
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
      // Duplicate check: Applicant, Start, and End
      const q = query(
        collection(db, COLLECTIONS.LEAVES),
        where('applicantId', '==', leave.applicantId),
        where('startDate', '==', leave.startDate),
        where('endDate', '==', leave.endDate)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`A similar leave request already exists`);
      }

      const id = Date.now().toString();
      const newLeave = { ...leave, id };
      await setDoc(doc(db, COLLECTIONS.LEAVES, id), newLeave);
      return newLeave;
    } catch (error: any) {
      if (error.message.includes('already exists')) throw error;
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
  deleteLeave: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.LEAVES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.LEAVES}/${id}`);
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
      // Duplicate check: Teacher and Month
      const q = query(
        collection(db, COLLECTIONS.SALARIES),
        where('teacherId', '==', salary.teacherId),
        where('month', '==', salary.month)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`Salary for ${salary.month} already recorded for this teacher`);
      }

      const id = Date.now().toString();
      const newSalary = { ...salary, id };
      await setDoc(doc(db, COLLECTIONS.SALARIES, id), newSalary);
      return newSalary;
    } catch (error: any) {
      if (error.message.includes('already recorded')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.SALARIES);
    }
  },
  deleteSalary: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.SALARIES, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.SALARIES}/${id}`);
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
      // Duplicate check: Category, Description, Amount, and Date
      const q = query(
        collection(db, COLLECTIONS.COSTS),
        where('category', '==', cost.category),
        where('description', '==', cost.description),
        where('amount', '==', cost.amount),
        where('date', '==', cost.date)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        throw new Error(`An identical expense record already exists`);
      }

      const id = Date.now().toString();
      const newCost = { ...cost, id };
      await setDoc(doc(db, COLLECTIONS.COSTS, id), newCost);
      return newCost;
    } catch (error: any) {
      if (error.message.includes('already exists')) throw error;
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.COSTS);
    }
  },
  updateCost: async (cost: OperationCost) => {
    try {
      // Duplicate check for update
      const q = query(
        collection(db, COLLECTIONS.COSTS),
        where('category', '==', cost.category),
        where('description', '==', cost.description),
        where('amount', '==', cost.amount),
        where('date', '==', cost.date)
      );
      const snapshot = await getDocs(q);
      const duplicate = snapshot.docs.find(doc => doc.id !== cost.id);
      if (duplicate) {
        throw new Error(`Another identical expense record already exists`);
      }

      await updateDoc(doc(db, COLLECTIONS.COSTS, cost.id), cost as any);
    } catch (error: any) {
      if (error.message.includes('already exists')) throw error;
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.COSTS}/${cost.id}`);
    }
  },
  deleteCost: async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.COSTS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.COSTS}/${id}`);
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
  },

  clearAllData: async () => {
    try {
      const collectionsToClear = [
        COLLECTIONS.STUDENTS,
        COLLECTIONS.TEACHERS,
        COLLECTIONS.FEES,
        COLLECTIONS.RESULTS,
        COLLECTIONS.COSTS,
        COLLECTIONS.SALARIES,
        COLLECTIONS.LEAVES,
        COLLECTIONS.ATTENDANCE
      ];

      for (const collName of collectionsToClear) {
        const snapshot = await getDocs(collection(db, collName));
        const batch = writeBatch(db);
        snapshot.docs.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'all_collections');
    }
  }
};
;
