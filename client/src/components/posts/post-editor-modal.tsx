import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Hash, TrendingUp, Camera, Upload, StickyNote, AlertTriangle, Plus, Paperclip, Send, Reply, FileText, Image as ImageIcon, Video, FileSpreadsheet, Bold, Italic, List, ListOrdered, MoreHorizontal, Edit, Trash2, Link, Smile } from "lucide-react";
import { FaInstagram, FaFacebook, FaTiktok, FaTwitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface PostEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  postId?: number;
  initialData?: any;
}

interface PostData {
  content: string;
  platforms: string[];
  scheduledAt?: Date;
  mediaUrls?: string[];
  hashtags?: string[];
  status: string;
  notes?: string;
}

export default function PostEditorModal({ 
  open, 
  onOpenChange, 
  defaultDate,
  postId,
  initialData
}: PostEditorModalProps) {
  const [content, setContent] = useState(initialData?.content || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialData?.platforms || ["instagram"]
  );
  const [scheduledDate, setScheduledDate] = useState(
    initialData?.scheduledAt 
      ? new Date(initialData.scheduledAt).toISOString().split('T')[0]
      : defaultDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialData?.scheduledAt 
      ? new Date(initialData.scheduledAt).toTimeString().split(' ')[0].slice(0, 5)
      : "14:00"
  );
  const [hashtags, setHashtags] = useState<string[]>(initialData?.hashtags || []);
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.mediaUrls || []);
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteThreads, setNoteThreads] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newNoteAttachments, setNewNoteAttachments] = useState<any[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [hasSelectedText, setHasSelectedText] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      setSelectedPlatforms(initialData.platforms || ["instagram"]);
      setHashtags(initialData.hashtags || []);
      setMediaUrls(initialData.mediaUrls || []);
      setStatus(initialData.status || "draft");
      setNotes(initialData.notes || "");
      
      if (initialData.scheduledAt) {
        const scheduleDate = new Date(initialData.scheduledAt);
        setScheduledDate(scheduleDate.toISOString().split('T')[0]);
        setScheduledTime(scheduleDate.toTimeString().split(' ')[0].slice(0, 5));
      }
    } else {
      // Reset form for new post
      setContent("");
      setSelectedPlatforms(["instagram"]);
      setHashtags([]);
      setMediaUrls([]);
      setStatus("draft");
      setNotes("");
      setScheduledDate(defaultDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
      setScheduledTime("14:00");
    }
    setHasUnsavedChanges(false);
  }, [initialData, defaultDate]);

  // Track changes to show unsaved dialog
  useEffect(() => {
    if (initialData) {
      const hasChanges = 
        content !== (initialData.content || "") ||
        JSON.stringify(selectedPlatforms) !== JSON.stringify(initialData.platforms || ["instagram"]) ||
        JSON.stringify(hashtags) !== JSON.stringify(initialData.hashtags || []) ||
        JSON.stringify(mediaUrls) !== JSON.stringify(initialData.mediaUrls || []) ||
        status !== (initialData.status || "draft") ||
        notes !== (initialData.notes || "");
      setHasUnsavedChanges(hasChanges);
    }
  }, [content, selectedPlatforms, hashtags, mediaUrls, status, notes, initialData]);

  const platforms = [
    { id: "instagram", name: "Instagram", icon: FaInstagram, color: "text-pink-500" },
    { id: "facebook", name: "Facebook", icon: FaFacebook, color: "text-blue-600" },
    { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "text-gray-900" },
    { id: "twitter", name: "Twitter", icon: FaTwitter, color: "text-blue-400" },
  ];

  const statusOptions = [
    { value: "draft", label: "Save as Draft" },
    { value: "review", label: "Send for Review" },
    { value: "pending_approval", label: "Submit for Approval" },
    { value: "scheduled", label: "Schedule Post" },
    { value: "published", label: "Publish Now" },
  ];

  const emojiCategories = [
    {
      name: "Smileys & People",
      icon: "😀",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
    },
    {
      name: "Animals & Nature",
      icon: "🐶",
      emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔"]
    },
    {
      name: "Food & Drink",
      icon: "🍎",
      emojis: ["🍎", "🍏", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🍵", "🧃", "🥤", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾"]
    },
    {
      name: "Activities",
      icon: "⚽",
      emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸️", "🥌", "🎿", "⛷️", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️", "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️", "🏄", "🏄‍♂️", "🏊‍♀️", "🏊", "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣", "🚣‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹‍♀️", "🤹", "🤹‍♂️", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🥁", "🪘", "🎹", "🎸", "🪕", "🎺", "🎷", "🪗", "🎻", "🪈", "🎲", "♟️", "🎯", "🎳", "🎮", "🎰", "🧩"]
    },
    {
      name: "Travel & Places",
      icon: "🚗",
      emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴", "🛹", "🛼", "🚁", "🛸", "✈️", "🛩️", "🛫", "🛬", "🪂", "💺", "🚀", "🛰️", "🚢", "⛵", "🚤", "🛥️", "🛳️", "⛴️", "🚧", "⚓", "🪝", "⛽", "🚨", "🚥", "🚦", "🛑", "🚏", "🗺️", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡", "🎢", "🎠", "⛲", "⛱️", "🏖️", "🏝️", "🏜️", "🌋", "⛰️", "🏔️", "🗻", "🏕️", "⛺", "🏠", "🏡", "🏘️", "🏚️", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏦", "🏨", "🏪", "🏫", "🏩", "💒", "🏛️", "⛪", "🕌", "🛕", "🕍", "🕋", "⛩️", "🛤️", "🛣️", "🗾", "🎑", "🏞️", "🌅", "🌄", "🌠", "🎇", "🎆", "🌇", "🌆", "🏙️", "🌃", "🌌", "🌉", "🌁"]
    },
    {
      name: "Objects",
      icon: "⌚",
      emojis: ["⌚", "📱", "📲", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "🖲️", "🕹️", "🗜️", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽️", "🎞️", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛", "⏳", "📡", "🔋", "🔌", "💡", "🔦", "🕯️", "🪔", "🧯", "🛢️", "💸", "💵", "💴", "💶", "💷", "🪙", "💰", "💳", "💎", "⚖️", "🪜", "🧰", "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪓", "🪚", "🔩", "⚙️", "🪤", "🧱", "⛓️", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "🪦", "⚱️", "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳️", "🩹", "🩺", "💊", "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🪣", "🧽", "🪒", "🧴", "🛎️", "🔑", "🗝️", "🚪", "🪑", "🛋️", "🛏️", "🛌", "🧸", "🖼️", "🛍️", "🛒", "🎁", "🎈", "🎏", "🎀", "🎊", "🎉", "🎎", "🏮", "🎐", "🧧", "✉️", "📩", "📨", "📧", "💌", "📥", "📤", "📦", "🏷️", "📪", "📫", "📬", "📭", "📮", "📯", "📜", "📃", "📄", "📑", "🧾", "📊", "📈", "📉", "🗒️", "🗓️", "📆", "📅", "🗑️", "📇", "🗃️", "🗳️", "🗄️", "📋", "📁", "📂", "🗂️", "🗞️", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚", "📖", "🔖", "🧷", "🔗", "📎", "🖇️", "📐", "📏", "🧮", "📌", "📍", "✂️", "🖊️", "🖋️", "✒️", "🖌️", "🖍️", "📝", "✏️", "🔍", "🔎", "🔏", "🔐", "🔒", "🔓"]
    },
    {
      name: "Symbols",
      icon: "❤️",
      emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️", "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲", "🅰️", "🅱️", "🆎", "🆑", "🅾️", "🆘", "❌", "⭕", "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨️", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼️", "⁉️", "🔅", "🔆", "〽️", "⚠️", "🚸", "🔱", "⚜️", "🔰", "♻️", "✅", "🈯", "💹", "❇️", "✳️", "❎", "🌐", "💠", "Ⓜ️", "🌀", "💤", "🏧", "🚾", "♿", "🅿️", "🛗", "🈳", "🈂️", "🛂", "🛃", "🛄", "🛅", "🚹", "🚺", "🚼", "⚧️", "🚻", "🚮", "🎦", "📶", "🈁", "🔣", "ℹ️", "🔤", "🔡", "🔠", "🆖", "🆗", "🆙", "🆒", "🆕", "🆓", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔢", "#️⃣", "*️⃣", "⏏️", "▶️", "⏸️", "⏯️", "⏹️", "⏺️", "⏭️", "⏮️", "⏩", "⏪", "⏫", "⏬", "◀️", "🔼", "🔽", "➡️", "⬅️", "⬆️", "⬇️", "↗️", "↘️", "↙️", "↖️", "↕️", "↔️", "↪️", "↩️", "⤴️", "⤵️", "🔀", "🔁", "🔂", "🔄", "🔃", "🎵", "🎶", "➕", "➖", "➗", "✖️", "♾️", "💲", "💱", "™️", "©️", "®️", "〰️", "➰", "➿", "🔚", "🔙", "🔛", "🔝", "🔜", "✔️", "☑️", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔺", "🔻", "🔸", "🔹", "🔶", "🔷", "🔳", "🔲", "▪️", "▫️", "◾", "◽", "◼️", "◻️", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "⬛", "⬜", "🟫", "🔈", "🔇", "🔉", "🔊", "🔔", "🔕", "📣", "📢", "👁️‍🗨️", "💬", "💭", "🗯️", "♠️", "♣️", "♥️", "♦️", "🃏", "🎴", "🀄", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕜", "🕝", "🕞", "🕟", "🕠", "🕡", "🕢", "🕣", "🕤", "🕥", "🕦", "🕧"]
    },
    {
      name: "Flags",
      icon: "🏁",
      emojis: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇫", "🇦🇽", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮", "🇦🇶", "🇦🇬", "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇲", "🇧🇹", "🇧🇴", "🇧🇦", "🇧🇼", "🇧🇷", "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇰🇭", "🇨🇲", "🇨🇦", "🇮🇨", "🇨🇻", "🇧🇶", "🇰🇾", "🇨🇫", "🇹🇩", "🇨🇱", "🇨🇳", "🇨🇽", "🇨🇨", "🇨🇴", "🇰🇲", "🇨🇬", "🇨🇩", "🇨🇰", "🇨🇷", "🇨🇮", "🇭🇷", "🇨🇺", "🇨🇼", "🇨🇾", "🇨🇿", "🇩🇰", "🇩🇯", "🇩🇲", "🇩🇴", "🇪🇨", "🇪🇬", "🇸🇻", "🇬🇶", "🇪🇷", "🇪🇪", "🇪🇹", "🇪🇺", "🇫🇰", "🇫🇴", "🇫🇯", "🇫🇮", "🇫🇷", "🇬🇫", "🇵🇫", "🇹🇫", "🇬🇦", "🇬🇲", "🇬🇪", "🇩🇪", "🇬🇭", "🇬🇮", "🇬🇷", "🇬🇱", "🇬🇩", "🇬🇵", "🇬🇺", "🇬🇹", "🇬🇬", "🇬🇳", "🇬🇼", "🇬🇾", "🇭🇹", "🇭🇳", "🇭🇰", "🇭🇺", "🇮🇸", "🇮🇳", "🇮🇩", "🇮🇷", "🇮🇶", "🇮🇪", "🇮🇲", "🇮🇱", "🇮🇹", "🇯🇲", "🇯🇵", "🎌", "🇯🇪", "🇯🇴", "🇰🇿", "🇰🇪", "🇰🇮", "🇽🇰", "🇰🇼", "🇰🇬", "🇱🇦", "🇱🇻", "🇱🇧", "🇱🇸", "🇱🇷", "🇱🇾", "🇱🇮", "🇱🇹", "🇱🇺", "🇲🇴", "🇲🇰", "🇲🇬", "🇲🇼", "🇲🇾", "🇲🇻", "🇲🇱", "🇲🇹", "🇲🇭", "🇲🇶", "🇲🇷", "🇲🇺", "🇾🇹", "🇲🇽", "🇫🇲", "🇲🇩", "🇲🇨", "🇲🇳", "🇲🇪", "🇲🇸", "🇲🇦", "🇲🇿", "🇲🇲", "🇳🇦", "🇳🇷", "🇳🇵", "🇳🇱", "🇳🇨", "🇳🇿", "🇳🇮", "🇳🇪", "🇳🇬", "🇳🇺", "🇳🇫", "🇰🇵", "🇲🇵", "🇳🇴", "🇴🇲", "🇵🇰", "🇵🇼", "🇵🇸", "🇵🇦", "🇵🇬", "🇵🇾", "🇵🇪", "🇵🇭", "🇵🇳", "🇵🇱", "🇵🇹", "🇵🇷", "🇶🇦", "🇷🇪", "🇷🇴", "🇷🇺", "🇷🇼", "🇼🇸", "🇸🇲", "🇸🇦", "🇸🇳", "🇷🇸", "🇸🇨", "🇸🇱", "🇸🇬", "🇸🇽", "🇸🇰", "🇸🇮", "🇬🇸", "🇸🇧", "🇸🇴", "🇿🇦", "🇰🇷", "🇸🇸", "🇪🇸", "🇱🇰", "🇧🇱", "🇸🇭", "🇰🇳", "🇱🇨", "🇲🇫", "🇵🇲", "🇻🇨", "🇸🇩", "🇸🇷", "🇸🇿", "🇸🇪", "🇨🇭", "🇸🇾", "🇹🇼", "🇹🇯", "🇹🇿", "🇹🇭", "🇹🇱", "🇹🇬", "🇹🇰", "🇹🇴", "🇹🇹", "🇹🇳", "🇹🇷", "🇹🇲", "🇹🇨", "🇹🇻", "🇻🇮", "🇺🇬", "🇺🇦", "🇦🇪", "🇬🇧", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "🇺🇸", "🇺🇾", "🇺🇿", "🇻🇺", "🇻🇦", "🇻🇪", "🇻🇳", "🇼🇫", "🇪🇭", "🇾🇪", "🇿🇲", "🇿🇼"]
    }
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      if (postId) {
        // Update existing post
        const response = await apiRequest("PATCH", `/api/posts/${postId}`, {
          ...postData,
          status,
          notes,
          scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`),
        });
        return response.json();
      } else {
        // Create new post
        const response = await apiRequest("POST", "/api/posts", {
          ...postData,
          createdBy: 1, // Mock user ID
          brandId: 1, // Mock brand ID
          status,
          notes,
          scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`),
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: postId ? "Post updated successfully" : "Post created successfully",
        variant: "success",
      });
      setHasUnsavedChanges(false);
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: postId ? "Failed to update post" : "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const generateCaptionMutation = useMutation({
    mutationFn: async (data: { topic: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-caption", data);
      return response.json();
    },
    onSuccess: (data) => {
      setContent(data.caption);
      toast({
        title: "Caption Generated",
        description: "AI has generated a new caption for your post",
      });
    },
  });

  const suggestHashtagsMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/suggest-hashtags", data);
      return response.json();
    },
    onSuccess: (data) => {
      setHashtags(data.hashtags || []);
      toast({
        title: "Hashtags Suggested",
        description: "AI has suggested relevant hashtags",
      });
    },
  });

  const optimizeContentMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/optimize-engagement", data);
      return response.json();
    },
    onSuccess: (data) => {
      setContent(data.optimizedContent);
      toast({
        title: "Content Optimized",
        description: `Content optimized for better engagement (Score: ${data.score}/100)`,
      });
    },
  });

  const suggestTimeMutation = useMutation({
    mutationFn: async (data: { platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/suggest-time", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScheduledTime(data.recommendedTime);
      toast({
        title: "Optimal Time Suggested",
        description: data.reasoning,
      });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
    setHasUnsavedChanges(true);
  };



  const handleGenerateCaption = () => {
    if (!content.trim()) {
      toast({
        title: "Enter a topic",
        description: "Please enter a topic or some content first",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingCaption(true);
    generateCaptionMutation.mutate({
      topic: content,
      platform: selectedPlatforms[0] || "instagram",
    });
    setIsGeneratingCaption(false);
  };

  const handleSuggestHashtags = () => {
    if (!content.trim()) {
      toast({
        title: "Enter content first",
        description: "Please enter some content before generating hashtags",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingHashtags(true);
    suggestHashtagsMutation.mutate({
      content,
      platform: selectedPlatforms[0] || "instagram",
    });
    setIsGeneratingHashtags(false);
  };

  const handleOptimizeContent = () => {
    if (!content.trim()) {
      toast({
        title: "Enter content first",
        description: "Please enter some content before optimizing",
        variant: "destructive",
      });
      return;
    }
    
    setIsOptimizing(true);
    optimizeContentMutation.mutate({
      content,
      platform: selectedPlatforms[0] || "instagram",
    });
    setIsOptimizing(false);
  };

  const handleSuggestTime = () => {
    suggestTimeMutation.mutate({
      platform: selectedPlatforms[0] || "instagram",
    });
  };

  const resetForm = () => {
    setContent("");
    setSelectedPlatforms(["instagram"]);
    setHashtags([]);
    setMediaUrls([]);
    setStatus("draft");
    setNotes("");
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime("14:00");
    setShowNotes(false);
    setNoteThreads([]);
    setNewNoteText("");
    setEditorKey(prev => prev + 1);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onOpenChange(false);
    resetForm();
  };

  const handleSaveAndClose = () => {
    handleSubmit();
    setShowUnsavedDialog(false);
  };

  const addEmoji = (emoji: string) => {
    setNewNoteText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatText = (format: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    let formattedText = "";
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'bullet':
        formattedText = `• ${selectedText}`;
        break;
      case 'number':
        formattedText = `1. ${selectedText}`;
        break;
      case 'link':
        setLinkText(selectedText);
        setShowLinkDialog(true);
        return;
      default:
        formattedText = selectedText;
    }

    range.deleteContents();
    range.insertNode(document.createTextNode(formattedText));
    selection.removeAllRanges();
  };

  const handleLinkSubmit = () => {
    if (!linkText.trim() || !linkUrl.trim()) return;

    const formattedLink = `[${linkText}](${linkUrl})`;
    setNewNoteText(prev => prev + formattedLink);
    setShowLinkDialog(false);
    setLinkText("");
    setLinkUrl("");
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newThread = {
      id: Date.now(),
      author: "Current User",
      text: newNoteText,
      timestamp: new Date(),
      edited: false,
      attachments: [...newNoteAttachments],
      replies: []
    };

    setNoteThreads(prev => [...prev, newThread]);
    setNewNoteText("");
    setNewNoteAttachments([]);
    setEditorKey(prev => prev + 1);
  };

  const startEditMessage = (messageId: number, text: string) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const saveEditMessage = () => {
    if (!editingText.trim()) return;

    setNoteThreads(prev => 
      prev.map(thread => 
        thread.id === editingMessageId 
          ? { ...thread, text: editingText, edited: true }
          : thread
      )
    );
    setEditingMessageId(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const deleteMessage = (messageId: number) => {
    setNoteThreads(prev => prev.filter(thread => thread.id !== messageId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.startsWith('video/')) return Video;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
    return FileText;
  };

  const handleNewNoteFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      const newAttachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size
      };
      setNewNoteAttachments(prev => [...prev, newAttachment]);
    });
  };

  const removeNewNoteAttachment = (attachmentId: number) => {
    setNewNoteAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };



  const handleTextChange = (text: string) => {
    setNewNoteText(text);
  };

  const handleTextSelection = () => {
    const textarea = document.querySelector('#new-note-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setHasSelectedText(start !== end);
    }
  };



  const handleAddReply = (threadId: number) => {
    if (!replyText.trim()) return;
    
    const reply = {
      id: Date.now(),
      text: replyText,
      author: "Current User",
      timestamp: new Date(),
      attachments: []
    };
    
    setNoteThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, replies: [...thread.replies, reply] }
        : thread
    ));
    setReplyText("");
    setReplyingTo(null);
  };

  const handleFileUpload = (threadId: number, files: FileList) => {
    const attachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file) // In real app, upload to server
    }));
    
    setNoteThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, attachments: [...thread.attachments, ...attachments] }
        : thread
    ));
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    
    // Automatically trigger the action based on status selection
    setTimeout(() => {
      handleSubmit();
    }, 100); // Small delay to ensure state is updated
  };

  const handleSubmit = (action?: 'draft' | 'review' | 'schedule') => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform required",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    const postData: PostData = {
      content: content.trim(),
      platforms: selectedPlatforms,
      hashtags,
      mediaUrls,
      notes: notes.trim(),
      status: status,
    };

    createPostMutation.mutate(postData);
  };

  return (
    <>
      {/* Main Edit Form - Slides up from bottom */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => handleClose()}
          />
          
          {/* Sliding Panel */}
          <div className={cn(
            "fixed bottom-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-out",
            "max-h-[90vh] overflow-hidden flex flex-col",
            showNotes ? "left-[30%]" : "left-0", // Show partially when notes are open
            open ? "translate-y-0" : "translate-y-full"
          )}>
            {/* Header */}
            <div className="p-6 border-b bg-white rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold">
                    {initialData 
                      ? `${initialData.content?.split('.')[0] || initialData.content?.split('!')[0] || initialData.content?.slice(0, 50)}...`
                      : "Create New Post"
                    }
                  </h2>
                  {postId && (
                    <span className="text-sm text-gray-500">#{postId}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className={cn(
                      "flex items-center space-x-1",
                      showNotes && "bg-blue-50 border-blue-200"
                    )}
                  >
                    <StickyNote className="h-4 w-4" />
                    <span>Notes</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClose()}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 mt-1">
                {initialData 
                  ? "Edit your social media post content, platforms, and scheduling settings."
                  : "Create and schedule your social media post across multiple platforms."
                }
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">

        <div className="space-y-6">
          {/* Platform Selection - Clickable Icons */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Platforms</Label>
            <div className="flex items-center gap-2">
              {selectedPlatforms.length > 0 ? (
                selectedPlatforms.map((platformId) => {
                  const platform = platforms.find(p => p.id === platformId);
                  if (!platform) return null;
                  const IconComponent = platform.icon;
                  return (
                    <button
                      key={platformId}
                      type="button"
                      onClick={() => setShowPlatformModal(true)}
                      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <IconComponent className={`w-6 h-6 ${platform.color}`} />
                    </button>
                  );
                })
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPlatformModal(true)}
                  className="p-2 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors text-gray-500"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
              {selectedPlatforms.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPlatformModal(true)}
                  className="p-2 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors text-gray-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Editor */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Caption</Label>
            <Textarea
              placeholder="Write your caption here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-32 resize-none"
            />
            
            {/* AI Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption}
                className="text-primary border-primary hover:bg-primary/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingCaption ? "Generating..." : "Generate Caption"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestHashtags}
                disabled={isGeneratingHashtags}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Hash className="mr-2 h-4 w-4" />
                {isGeneratingHashtags ? "Generating..." : "Suggest Hashtags"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizeContent}
                disabled={isOptimizing}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {isOptimizing ? "Optimizing..." : "Optimize"}
              </Button>
            </div>

            {/* Hashtags Display */}
            {hashtags.length > 0 && (
              <div className="mt-3">
                <Label className="text-sm font-medium mb-2 block">Suggested Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Media</Label>
            
            {/* Show existing media if editing */}
            {mediaUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current media:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {url.includes('.mp4') || url.includes('video') ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-xs text-gray-500">Video</span>
                        </div>
                      ) : (
                        <img 
                          src={url} 
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100" height="100" fill="#f3f4f6"/>
                                <text x="50" y="50" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy="4">Image</text>
                              </svg>
                            `)}`;
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop media here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports images, videos up to 100MB
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Publish Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Publish Time</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestTime}
                  className="text-primary"
                >
                  AI Best Time
                </Button>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="flex justify-between items-center">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t bg-white flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={createPostMutation.isPending || !content.trim() || selectedPlatforms.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {createPostMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
            </div>
          </div>
        </>
      )}
      
      {/* Notes Slide-in Panel - Slides from right, positioned next to edit form */}
      {showNotes && (
        <div className="fixed top-0 right-0 bottom-0 w-96 bg-white z-[110] transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col shadow-2xl border-l min-h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <h2 className="text-lg font-semibold">Notes & Comments</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-1 bg-gray-50 p-4 min-h-[400px]">
            {/* Note Messages - Slack Style */}
          {noteThreads.map((thread) => (
            <div key={thread.id} className="group hover:bg-gray-100 rounded p-2 transition-colors">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mt-1">
                  {thread.author.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Message Header */}
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-gray-900 text-sm">{thread.author}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {thread.edited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          const dropdown = document.getElementById(`dropdown-${thread.id}`);
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <div id={`dropdown-${thread.id}`} className="hidden absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 py-1">
                        <button
                          onClick={() => startEditMessage(thread.id, thread.text)}
                          className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMessage(thread.id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Content or Edit Input */}
                  {editingMessageId === thread.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEditMessage}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-800 leading-relaxed">
                      {thread.text.split('\n').map((line, index) => {
                        // Handle links [text](url)
                        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                        const parts = line.split(linkRegex);
                        
                        return (
                          <div key={index}>
                            {parts.map((part, partIndex) => {
                              if (partIndex % 3 === 1) {
                                // This is link text
                                const url = parts[partIndex + 1];
                                return <a key={partIndex} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{part}</a>;
                              } else if (partIndex % 3 === 2) {
                                // This is the URL, skip it
                                return null;
                              } else {
                                // Regular text formatting
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                                } else if (part.startsWith('*') && part.endsWith('*')) {
                                  return <em key={partIndex}>{part.slice(1, -1)}</em>;
                                } else if (part.startsWith('• ')) {
                                  return <div key={partIndex} className="ml-4">• {part.slice(2)}</div>;
                                } else if (part.match(/^\d+\. /)) {
                                  return <div key={partIndex} className="ml-4">{part}</div>;
                                } else {
                                  return <span key={partIndex}>{part}</span>;
                                }
                              }
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Attachments */}
                  {thread.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {thread.attachments.map((attachment: any) => {
                        const FileIcon = getFileIcon(attachment.type);
                        return (
                          <div key={attachment.id} className="flex items-center gap-2 bg-white border rounded px-3 py-2 text-xs shadow-sm">
                            <FileIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{attachment.name}</span>
                            <span className="text-gray-400">({Math.round(attachment.size / 1024)}KB)</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Replies */}
              {thread.replies.length > 0 && (
                <div className="ml-11 mt-3 space-y-2">
                  {thread.replies.map((reply: any) => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {reply.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-gray-900 text-xs">{reply.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700 mt-1">{reply.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {noteThreads.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <StickyNote className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm">Start the conversation with your team</p>
            </div>
          )}
        </div>
        
        {/* Add New Message */}
        <div className="border-t pt-4 bg-white flex-shrink-0">
          <div className="space-y-2">
            <RichTextEditor
              key={editorKey}
              content={newNoteText}
              onChange={(content, isHtml) => {
                // Always just store the content as is
                setNewNoteText(content)
              }}
              onSend={handleAddNote}
              placeholder="Type a message..."
              className="min-h-[50px]"
              autoFocus={showNotes}
            />
            
            {/* New Note Attachments */}
            {newNoteAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newNoteAttachments.map((attachment) => {
                  const FileIcon = getFileIcon(attachment.type);
                  return (
                    <div key={attachment.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 text-xs">
                      <FileIcon className="h-3 w-3" />
                      <span>{attachment.name}</span>
                      <span className="text-gray-500">({Math.round(attachment.size / 1024)}KB)</span>
                      <button
                        onClick={() => removeNewNoteAttachment(attachment.id)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Rich Text Formatting Toolbar */}
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2 z-10">
                {/* Always visible: Upload and Emoji */}
                <input
                  type="file"
                  id="mobile-file-upload"
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleNewNoteFileUpload(e.target.files);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="text-gray-700 hover:text-gray-900 p-2 bg-white border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => {
                    const fileInput = document.getElementById('mobile-file-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="relative z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-700 hover:text-gray-900 p-2 bg-white border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-20 w-80 animate-in slide-in-from-bottom-2 duration-300">
                      {/* Category Tabs */}
                      <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        {emojiCategories.map((category, index) => (
                          <button
                            key={index}
                            onClick={() => setEmojiCategory(index)}
                            className={`flex-1 p-3 text-lg transition-all duration-200 ${
                              emojiCategory === index 
                                ? 'bg-white border-b-2 border-blue-500 text-blue-600' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title={category.name}
                          >
                            {category.icon}
                          </button>
                        ))}
                      </div>
                      
                      {/* Category Content */}
                      <div className="p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                          {emojiCategories[emojiCategory].name}
                        </div>
                        <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                          {emojiCategories[emojiCategory].emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => addEmoji(emoji)}
                              className="hover:bg-blue-50 hover:scale-110 rounded-lg p-2 text-lg flex items-center justify-center min-h-[2.5rem] min-w-[2.5rem] transition-all duration-150 hover:shadow-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Navigation Arrows */}
                      <div className="flex justify-between items-center px-4 pb-3">
                        <button
                          onClick={() => setEmojiCategory(Math.max(0, emojiCategory - 1))}
                          disabled={emojiCategory === 0}
                          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="text-xs text-gray-400">
                          {emojiCategory + 1} / {emojiCategories.length}
                        </div>
                        <button
                          onClick={() => setEmojiCategory(Math.min(emojiCategories.length - 1, emojiCategory + 1))}
                          disabled={emojiCategory === emojiCategories.length - 1}
                          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Text Formatting Buttons - Only visible when text is selected */}
                {hasSelectedText && (
                  <div className="flex items-center gap-1 ml-2 border-l pl-2 bg-white z-10 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => formatText('bold')}
                      className="text-gray-500 hover:text-gray-700 p-1 bg-white border border-gray-200 shadow-sm"
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => formatText('italic')}
                      className="text-gray-500 hover:text-gray-700 p-1 bg-white border border-gray-200 shadow-sm"
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => formatText('bullet')}
                      className="text-gray-500 hover:text-gray-700 p-1 bg-white border border-gray-200 shadow-sm"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => formatText('number')}
                      className="text-gray-500 hover:text-gray-700 p-1 bg-white border border-gray-200 shadow-sm"
                    >
                      <ListOrdered className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => formatText('link')}
                      className="text-gray-500 hover:text-gray-700 p-1 bg-white border border-gray-200 shadow-sm"
                    >
                      <Link className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {/* Link Dialog */}
                {showLinkDialog && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-4 w-80 z-20">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Link Text</label>
                        <Input
                          value={linkText}
                          onChange={(e) => setLinkText(e.target.value)}
                          placeholder="Enter link text..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">URL</label>
                        <Input
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLinkDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleLinkSubmit}
                          disabled={!linkText.trim() || !linkUrl.trim()}
                        >
                          Add Link
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNotes(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="bg-primary hover:bg-primary/90 px-4 py-2 z-10 relative"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

    {/* Platform Selection Modal */}
    <Dialog open={showPlatformModal} onOpenChange={setShowPlatformModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Platforms</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {platforms.map((platform) => {
            const IconComponent = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <div 
                key={platform.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                onClick={() => handlePlatformToggle(platform.id)}
              >
                <Checkbox
                  checked={isSelected}
                  readOnly
                />
                <IconComponent className={`w-6 h-6 ${platform.color}`} />
                <span className="text-sm font-medium">{platform.name}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowPlatformModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowPlatformModal(false)}
            disabled={selectedPlatforms.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Unsaved Changes Dialog */}
    <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Unsaved Changes</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes that will be lost if you close the editor. Would you like to save your changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDiscardChanges}>
            Discard Changes
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSaveAndClose}>
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
);
}
