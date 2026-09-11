from fastapi import APIRouter

router = APIRouter(prefix="/safety", tags=["safety"])

SAFETY_CARDS = [
    {
        "id": "battery",
        "title_en": "Battery",
        "title_hi": "बैटरी",
        "title_mr": "बॅटरी सुरक्षा",
        "icon": "🔋",
        "dont": [
            {"en": "Do not puncture", "hi": "पंचर न करें", "mr": "पंक्चर करू नका"},
            {"en": "Do not burn", "hi": "जलाएँ नहीं", "mr": "जाळू नका"},
        ],
        "do": [{"en": "Store separately", "hi": "अलग रखें", "mr": "वेगळे ठेवा"}],
        "audio_en": "Battery safety: Do not puncture. Do not burn. Store separately.",
        "audio_hi": "बैटरी सुरक्षा: पंचर न करें। जलाएँ नहीं। अलग रखें।",
        "audio_mr": "बॅटरी जाळू नका, तोडू नका. लीथियम बॅटरी विषारी असतात. नेहमी अधिकृत ठिकाणी द्या.",
    },
    {
        "id": "crt",
        "title_en": "CRT",
        "title_hi": "सीआरटी",
        "title_mr": "CRT मॉनिटर सुरक्षा",
        "icon": "🖥️",
        "dont": [{"en": "Do not break", "hi": "तोड़ें नहीं", "mr": "फोडू नका"}],
        "do": [{"en": "Handle carefully", "hi": "सावधानी से उठाएँ", "mr": "काळजीपूर्वक हाताळा"}],
        "audio_en": "CRT safety: Do not break. Handle carefully.",
        "audio_hi": "सीआरटी सुरक्षा: तोड़ें नहीं। सावधानी से उठाएँ।",
        "audio_mr": "CRT मध्ये शिसे असते. तोडू नका, जाळू नका. अधिकृत पुनर्वापरकर्त्याकडे द्या.",
    },
    {
        "id": "cable",
        "title_en": "Cable",
        "title_hi": "केबल",
        "title_mr": "केबल सुरक्षा",
        "icon": "🔗",
        "dont": [{"en": "Do not burn wires", "hi": "तार न जलाएँ", "mr": "तारा जाळू नका"}],
        "do": [{"en": "Send intact to authorized recycler", "hi": "अधिकृत रिसाइक्लर को साबुत भेजें", "mr": "अधिकृत पुनर्वापरकर्त्याकडे पाठवा"}],
        "audio_en": "Cable safety: Do not burn wires. Send intact to authorized recycler.",
        "audio_hi": "केबल सुरक्षा: तार न जलाएँ। अधिकृत रिसाइक्लर को साबुत भेजें।",
        "audio_mr": "केबल सुरक्षा: तारा जाळू नका. अधिकृत पुनर्वापरकर्त्याकडे अखंड पाठवा.",
    },
    {
        "id": "pcb",
        "title_en": "PCB",
        "title_hi": "पीसीबी",
        "title_mr": "PCB बोर्ड सुरक्षा",
        "icon": "🔌",
        "dont": [
            {"en": "Avoid acid extraction", "hi": "एसिड निकालना न करें", "mr": "आम्लाने प्रक्रिया टाळा"},
            {"en": "Avoid open burning", "hi": "खुला न जलाएँ", "mr": "उघड्यावर जाळू नका"},
        ],
        "do": [{"en": "Hand over to verified recycler", "hi": "सत्यापित रिसाइक्लर को दें", "mr": "सत्यापित पुनर्वापरकर्त्याकडे द्या"}],
        "audio_en": "PCB safety: Avoid acid extraction. Avoid open burning.",
        "audio_hi": "पीसीबी सुरक्षा: एसिड निकालना न करें। खुला न जलाएँ।",
        "audio_mr": "PCB बोर्ड आम्लावर टाकू नका. रसायने हातात येणार नाहीत याची काळजी घ्या. दस्ताने घाला.",
    },
    {
        "id": "general",
        "title_en": "General Safety",
        "title_hi": "सामान्य सुरक्षा",
        "title_mr": "सामान्य ई-वेस्ट सुरक्षा",
        "icon": "⚠️",
        "dont": [
            {"en": "Do not burn e-waste", "hi": "ई-वेस्ट न जलाएँ", "mr": "ई-वेस्ट उन्हात जाळू नका"},
            {"en": "Keep away from children", "hi": "बच्चों से दूर रखें", "mr": "बालकांपासून दूर ठेवा"},
        ],
        "do": [{"en": "Always give to authorized recycler", "hi": "हमेशा अधिकृत रिसाइक्लर को दें", "mr": "नेहमी अधिकृत रिसाइक्लरला द्या"}],
        "audio_en": "General e-waste safety: Do not burn e-waste. Keep away from children. Always give to authorized recycler.",
        "audio_hi": "सामान्य सुरक्षा: ई-वेस्ट न जलाएँ। बच्चों से दूर रखें। हमेशा अधिकृत रिसाइक्लर को दें।",
        "audio_mr": "ई-वेस्ट उन्हात जाळू नका. बालकांपासून दूर ठेवा. नेहमी अधिकृत रिसाइक्लरला द्या.",
    },
]


@router.get("/")
def safety_cards():
    return {"cards": SAFETY_CARDS, "is_demo": True}
