document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const inputSection = document.getElementById('inputSection');
    const previewSection = document.getElementById('previewSection');
    const logoUpload = document.getElementById('logoUpload');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    
    const academyName = document.getElementById('academyName');
    const teacherName = document.getElementById('teacherName');
    const supervisorName = document.getElementById('supervisorName');
    const totalStudents = document.getElementById('totalStudents');
    const presentStudents = document.getElementById('presentStudents');
    const absentStudents = document.getElementById('absentStudents');
    const listenerStudents = document.getElementById('listenerStudents');
    const additionalNotes = document.getElementById('additionalNotes');
    
    const attendanceRate = document.getElementById('attendanceRate');
    const absenceRate = document.getElementById('absenceRate');
    
    let logoDataUrl = '';

    // ضبط التاريخ الهجري والميلادي تلقائياً
    const setDates = () => {
        const today = new Date();
        const gregorianOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('docGregorianDate').textContent = today.toLocaleDateString('ar-EG', gregorianOptions);
        try {
            const hijriOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', hijriOptions).format(today);
            document.getElementById('docHijriDate').textContent = hijriDate;
        } catch (e) {
            document.getElementById('docHijriDate').textContent = "غير متوفر";
        }
    };
    setDates();

    // رفع الشعار وتحويله لـ DataURL
    logoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                logoDataUrl = event.target.result;
                uploadPlaceholder.innerHTML = `<img src="${logoDataUrl}" alt="شعار الأكاديمية">`;
                const docLogoImg = document.getElementById('docLogoImg');
                docLogoImg.src = logoDataUrl;
                docLogoImg.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    const setError = (element, message) => {
        const group = element.closest('.form-group');
        const errorSpan = group.querySelector('.error-msg');
        group.classList.add('invalid');
        errorSpan.textContent = message;
    };

    const clearError = (element) => {
        const group = element.closest('.form-group');
        group.classList.remove('invalid');
    };

    const validateNumbers = () => {
        let isValid = true;
        const total = parseInt(totalStudents.value) || 0;
        const present = parseInt(presentStudents.value) || 0;
        const absent = parseInt(absentStudents.value) || 0;
        const listeners = parseInt(listenerStudents.value) || 0;

        [totalStudents, presentStudents, absentStudents, listenerStudents].forEach(clearError);

        if (total < 0) { setError(totalStudents, "لا يمكن أن يكون سالباً"); isValid = false; }
        if (present < 0) { setError(presentStudents, "لا يمكن أن يكون سالباً"); isValid = false; }
        if (absent < 0) { setError(absentStudents, "لا يمكن أن يكون سالباً"); isValid = false; }
        if (listeners < 0) { setError(listenerStudents, "لا يمكن أن يكون سالباً"); isValid = false; }

        updateStats(total, present, absent);
        return isValid;
    };

    [totalStudents, presentStudents, absentStudents, listenerStudents].forEach(input => {
        input.addEventListener('input', validateNumbers);
    });

    const updateStats = (total, present, absent) => {
        if (total > 0) {
            attendanceRate.textContent = `${((present / total) * 100).toFixed(1)}%`;
            absenceRate.textContent = `${((absent / total) * 100).toFixed(1)}%`;
        } else {
            attendanceRate.textContent = `0%`;
            absenceRate.textContent = `0%`;
        }
    };

    const validateTextInputs = () => {
        let isValid = true;
        [academyName, teacherName, supervisorName].forEach(input => {
            if (input.value.trim() === '') {
                setError(input, "مطلوب");
                isValid = false;
            } else { clearError(input); }
        });
        return isValid;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateTextInputs() && validateNumbers()) {
            populatePreview();
            inputSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    const populatePreview = () => {
        document.getElementById('docAcademyName').textContent = academyName.value.trim();
        document.getElementById('docTeacherName').textContent = teacherName.value;
        document.getElementById('docSupervisorName').textContent = supervisorName.value;
        
        const classStatus = document.querySelector('input[name="classStatus"]:checked').value;
        const statusElement = document.getElementById('docClassStatus');
        statusElement.textContent = classStatus === 'نعم' ? 'تمت بحمد الله' : 'لم تتم';
        statusElement.style.color = classStatus === 'نعم' ? 'var(--color-primary)' : 'var(--color-error)';
        
        const notesValue = additionalNotes.value.trim();
        document.getElementById('docNotes').textContent = notesValue !== '' ? notesValue : '- لا توجد ملاحظات إضافية -';
        
        const total = parseInt(totalStudents.value) || 0;
        const present = parseInt(presentStudents.value) || 0;
        const absent = parseInt(absentStudents.value) || 0;
        
        document.getElementById('docTotal').textContent = total;
        document.getElementById('docPresent').textContent = present;
        document.getElementById('docAbsent').textContent = absent;
        document.getElementById('docListeners').textContent = listenerStudents.value || 0;
    };

    document.getElementById('backBtn').addEventListener('click', () => {
        previewSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // استخراج مستند PDF
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        const element = document.getElementById('reportDocument');
        const btn = document.getElementById('downloadPdfBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري استخراج PDF...';
        btn.disabled = true;

        const dateString = new Date().toISOString().split('T')[0];
        
        const opt = {
            margin:       0,
            filename:     `تقرير-الحلقة-${dateString}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error("PDF Hatası: ", err);
            btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> فشل التحميل';
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        });
    });

    // تحويل التقرير لصورة والمشاركة المباشرة
    document.getElementById('shareImageBtn').addEventListener('click', async () => {
        const element = document.getElementById('reportDocument');
        const btn = document.getElementById('shareImageBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تجهيز الصورة...';
        btn.disabled = true;

        try {
            const canvas = await html2canvas(element, {
                scale: 2.5,
                useCORS: true,
                scrollY: 0
            });

            canvas.toBlob(async (blob) => {
                const dateString = new Date().toISOString().split('T')[0];
                const fileName = `تقرير_الأكاديمية_${dateString}.jpg`;
                const file = new File([blob], fileName, { type: 'image/jpeg' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'التقرير اليومي للحلقات',
                            text: 'مرفق لكم التقرير اليومي الصادر عن الأكاديمية.'
                        });
                    } catch (shareError) {
                        console.log('تم إلغاء عملية المشاركة.', shareError);
                    }
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    alert("تم حفظ التقرير كصورة في جهازك بنجاح! يمكنك الآن إرسالها وإرفاقها يدوياً عبر تليجرام أو واتساب.");
                }
                
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 'image/jpeg', 0.98);
            
        } catch (err) {
            console.error("خطأ أثناء معالجة الصورة: ", err);
            btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> فشل الإجراء';
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        }
    });
});