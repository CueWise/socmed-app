import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Hash, TrendingUp, Camera, Upload, StickyNote, AlertTriangle, Plus, Paperclip, Send, Reply, FileText, Image as ImageIcon, Video, FileSpreadsheet, Bold, Italic, List, ListOrdered, MoreHorizontal, Edit, Trash2, Link, Smile, Menu, Play, Calendar, Clock, MessageSquare, MoreVertical, Code, AlignLeft, AlignCenter, AlignRight, Type, Eye, Monitor, Smartphone, Heart, MessageCircle, Bookmark, ThumbsUp, Share, Repeat2 } from "lucide-react";
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

// Enhanced emoji picker with categories
const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void, onClose: () => void }) => {
  const [selectedCategory, setSelectedCategory] = useState('faces');
  
  const emojiCategories = {
    faces: {
      name: 'Faces',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '🥸', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😶‍🌫️', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
    },
    gestures: {
      name: 'Gestures',
      emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✊', '👊', '🤛', '🤜', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧘']
    },
    hearts: {
      name: 'Hearts',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🔥', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '💯', '💫', '🌀', '🌈', '☀️', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🪐', '💝', '🎀', '🎁', '🎊', '🎉', '🎈', '🎂', '🎆', '🎇', '🧨']
    },
    objects: {
      name: 'Objects',
      emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🪫', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪓', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '🪬', '💈', '⚗️', '🔭', '🔬', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓', '🪀', '🎮', '🕹️', '🎰', '🎲', '🧩', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢']
    },
    nature: {
      name: 'Nature',
      emojis: ['🌱', '🌿', '☘️', '🍀', '🎋', '🪴', '🎍', '🌾', '🌲', '🌳', '🌴', '🌵', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🌮', '🌯', '🫔', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🧂', '🍩', '🍪', '🌰', '🥜', '🍯', '🌷', '🌸', '🌹', '🥀', '🌺', '🌻', '🌼', '🌻', '🏵️', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌷', '💐', '🍄', '🌰', '🎃', '🐚', '🪨', '🪵', '🪶', '🪹', '🪺', '🗻', '🏔️', '⛰️', '🌋', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛴', '🚲', '🛺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🪐', '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️']
    },
    food: {
      name: 'Food',
      emojis: ['🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🫘', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🧂', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🫙', '🦐', '🦑', '🦪', '🐙', '🪼', '🦞', '🦀', '🐡', '🐠', '🐟', '🐠', '🐡', '🦈', '🐳', '🐋', '🐬', '🦭', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐠', '🐡', '🦈', '🐳', '🐋', '🐬', '🦭', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕']
    },
    activities: {
      name: 'Activities',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🪘', '🥁', '🪗', '🎷', '🎺', '🪕', '🎸', '🪈', '🎻', '🎹', '🪆', '🎯', '🎳', '🎮', '🎰', '🧩', '🎲', '♠️', '♥️', '♦️', '♣️', '♟️', '🃏', '🀄', '🎴']
    },
    travel: {
      name: 'Travel',
      emojis: ['🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏧', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛴', '🚲', '🛺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🛑', '🚥', '🚦', '🛗', '⚓', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸']
    },
    symbols: {
      name: 'Symbols',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-h-80 overflow-hidden w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Choose Emoji</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Category tabs */}
        <div className="flex border-b overflow-x-auto">
          {Object.entries(emojiCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={cn(
                "px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                selectedCategory === key
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Emoji grid */}
        <div className="p-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Platform selection modal
const PlatformSelectionModal = ({ 
  open, 
  onClose, 
  selectedPlatforms, 
  onSelectionChange 
}: { 
  open: boolean; 
  onClose: () => void; 
  selectedPlatforms: string[];
  onSelectionChange: (platforms: string[]) => void;
}) => {
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'text-black' },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-blue-400' }
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Select Platforms</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            
            return (
              <label key={platform.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange([...selectedPlatforms, platform.id]);
                    } else {
                      onSelectionChange(selectedPlatforms.filter(p => p !== platform.id));
                    }
                  }}
                  className="rounded"
                />
                <Icon className={cn("h-6 w-6", platform.color)} />
                <span className="font-medium">{platform.name}</span>
              </label>
            );
          })}
        </div>
        
        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

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
  const [showMainMenu, setShowMainMenu] = useState(false);
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
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{url: string, type: 'image' | 'video', file?: File}[]>([]);
  const [emojiTarget, setEmojiTarget] = useState<'content' | 'note' | 'reply'>('content');
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [hasSelectedText, setHasSelectedText] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Enhanced emoji categories
  const emojiCategories = {
    faces: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '🥸', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭'],
    gestures: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✊', '👊', '🤛', '🤜', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👋', '🤚', '🖐️', '✋', '🖖', '💪', '🦾', '🦿', '🦵', '🦶'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💯', '💢', '💥', '💫', '💦', '💨', '🔥', '⭐', '🌟', '✨', '⚡', '☄️'],
    objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️'],
    nature: ['🌱', '🌿', '☘️', '🍀', '🎋', '🪴', '🎍', '🌾', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🥀', '🌺', '🌻', '🌼', '🌙', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌞', '⭐', '🌟', '💫', '✨'],
    food: ['🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯'],
    gifs: ['🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎯', '🎳', '🎮', '🎰', '🧩', '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🎴', '🀄'],
    stickers: ['⭐', '✨', '💥', '💫', '💨', '💢', '💯', '🔥', '💎', '🌟', '⚡', '☄️', '🌈', '☀️', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🪐']
  };

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
      
      if (defaultDate) {
        setScheduledDate(defaultDate.toISOString().split('T')[0]);
      }
    }
  }, [initialData, defaultDate, open]);

  // Track unsaved changes
  useEffect(() => {
    if (initialData) {
      const hasChanges = 
        content !== (initialData.content || "") ||
        JSON.stringify(selectedPlatforms.sort()) !== JSON.stringify((initialData.platforms || ["instagram"]).sort()) ||
        JSON.stringify(hashtags) !== JSON.stringify(initialData.hashtags || []) ||
        status !== (initialData.status || "draft") ||
        notes !== (initialData.notes || "");
      setHasUnsavedChanges(hasChanges);
    } else {
      // For new posts, check if any content exists
      const hasContent = content.trim() || selectedPlatforms.length > 1 || hashtags.length > 0 || notes.trim();
      setHasUnsavedChanges(!!hasContent);
    }
  }, [content, selectedPlatforms, hashtags, status, notes, initialData]);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'text-black' },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-blue-400' },
  ];



  const createPostMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PATCH' : 'POST';
      
      const scheduleDateTime = scheduledDate && scheduledTime 
        ? new Date(`${scheduledDate}T${scheduledTime}:00`)
        : undefined;
      
      const payload = {
        ...postData,
        scheduledAt: scheduleDateTime?.toISOString(),
      };
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: postId ? "Post updated" : "Post created",
        description: postId ? "Your post has been updated successfully." : "Your post has been created successfully.",
      });
      setHasUnsavedChanges(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = () => {
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

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    const newNote = {
      id: Date.now(),
      author: "Current User",
      content: newNoteText,
      timestamp: new Date().toISOString(),
      attachments: newNoteAttachments,
      edited: false,
      replies: []
    };
    
    setNoteThreads([...noteThreads, newNote]);
    setNewNoteText("");
    setNewNoteAttachments([]);
    setEditorKey(prev => prev + 1);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      {/* Main Container */}
      <div className="h-full flex">
        
        {/* Left Content Area */}
        <div className={cn(
          "flex-1 bg-white transition-all duration-300 ease-in-out",
          showMainMenu ? "md:mr-80 mr-0" : "mr-0"
        )}>
          
          {/* Header */}
          <div className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
            <h1 className="text-lg md:text-xl font-semibold">
              {postId ? "Edit Post" : "Create Post"}
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMainMenu(!showMainMenu)}
                className="flex items-center space-x-1 md:space-x-2"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            {showNotes ? (
              /* Notes View */
              <div className="h-full flex flex-col">
                {/* Notes Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Notes & Comments</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotes(false)}
                    >
                      Back to Post
                    </Button>
                  </div>
                </div>
                
                {/* Notes Content */}
                <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                  <div className="space-y-4">
                    {noteThreads.map((thread) => (
                      <div key={thread.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {thread.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-medium text-gray-900">{thread.author}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-gray-700">{thread.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Notes Input */}
                <div className="p-6 border-t bg-white"
                     style={{ 
                       paddingBottom: 'max(24px, env(keyboard-inset-height, 0px))'
                     }}>
                  <div className="space-y-3">
                    <RichTextEditor
                      key={editorKey}
                      placeholder="Add a note or comment..."
                      onChange={(text, isRich) => setNewNoteText(text)}
                      autoFocus
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*,video/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                console.log('File selected for Notes:', file);
                              }
                            };
                            input.click();
                          }}
                          className="p-2 h-8 w-8"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEmojiTarget('note');
                            setShowEmojiPicker(true);
                          }}
                          className="p-2 h-8 w-8"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="h-12 w-12 p-0"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Post Edit View */
              <div className="p-4 space-y-4 max-w-md mx-auto">
                
                {/* Platform Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Platforms</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPlatformModal(true)}
                      className="text-xs"
                    >
                      Select Platforms
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {platforms
                      .filter(platform => selectedPlatforms.includes(platform.id))
                      .map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <div key={platform.id} className="flex items-center">
                            <Icon className={cn("h-6 w-6", platform.color)} />
                          </div>
                        );
                      })}
                    {selectedPlatforms.length === 0 && (
                      <p className="text-sm text-gray-500">No platforms selected</p>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 min-h-[120px] resize-none"
                    maxLength={2200}
                  />
                  
                  {/* Content Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,video/*,image/gif';
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = Array.from((e.target as HTMLInputElement).files || []);
                            files.forEach(file => {
                              const url = URL.createObjectURL(file);
                              const type = file.type.startsWith('video/') ? 'video' : 'image';
                              setAttachedMedia(prev => [...prev, { url, type, file }]);
                            });
                          };
                          input.click();
                        }}
                        className="p-2 h-8 w-8"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEmojiTarget('content');
                          setShowEmojiPicker(true);
                        }}
                        className="p-2 h-8 w-8"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {content.length}/2200 characters
                    </p>
                  </div>
                  
                  {/* Debug: Always show media example for testing */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Test Preview Panel</span>
                      <button
                        onClick={() => setShowPreviewPanel(true)}
                        className="text-xs px-2 py-1 h-6 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        Open Preview
                      </button>
                    </div>
                  </div>

                  {/* Media Thumbnails */}
                  {attachedMedia.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Attached Media ({attachedMedia.length})</span>
                        <button
                          onClick={() => setShowPreviewPanel(true)}
                          className="text-xs px-2 py-1 h-6 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          Preview
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {attachedMedia.map((media, index) => (
                          <div key={index} className="relative flex-shrink-0">
                            {media.type === 'image' ? (
                              <img 
                                src={media.url} 
                                alt={`Attachment ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                <Play className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                            <button
                              onClick={() => setAttachedMedia(prev => prev.filter((_, i) => i !== index))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hashtags */}
                <div>
                  <Label className="text-sm font-medium">Hashtags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      placeholder="Add hashtag..."
                      className="w-32 h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim().replace('#', '');
                          if (value && !hashtags.includes(value)) {
                            setHashtags([...hashtags, value]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="scheduled-date" className="text-sm font-medium">Schedule Date</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled-time" className="text-sm font-medium">Schedule Time</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={createPostMutation.isPending || !content.trim() || selectedPlatforms.length === 0}
                    className="w-full"
                  >
                    {createPostMutation.isPending ? "Saving..." : postId ? "Update Post" : "Create Post"}
                  </Button>
                  <Button variant="outline" onClick={handleClose} className="w-full">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Menu */}
        <div className={cn(
          "fixed top-0 right-0 h-full w-full md:w-80 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out z-10",
          showMainMenu ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Menu Header */}
          <div className="h-16 border-b flex items-center justify-between px-6">
            <h3 className="font-semibold">Menu</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMainMenu(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Menu Content */}
          <div className="p-6 space-y-4">
            <Button
              variant={showNotes ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => {
                setShowNotes(!showNotes);
                setShowMainMenu(false);
              }}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Notes & Comments
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsGeneratingCaption(true);
                // AI caption generation logic here
                setTimeout(() => setIsGeneratingCaption(false), 2000);
              }}
              disabled={isGeneratingCaption}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingCaption ? "Generating..." : "AI Caption"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsGeneratingHashtags(true);
                // AI hashtag generation logic here
                setTimeout(() => setIsGeneratingHashtags(false), 2000);
              }}
              disabled={isGeneratingHashtags}
            >
              <Hash className="h-4 w-4 mr-2" />
              {isGeneratingHashtags ? "Generating..." : "AI Hashtags"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsOptimizing(true);
                // Content optimization logic here
                setTimeout(() => setIsOptimizing(false), 2000);
              }}
              disabled={isOptimizing}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {isOptimizing ? "Optimizing..." : "Optimize Content"}
            </Button>
          </div>
        </div>
      </div>

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-[200] bg-black bg-opacity-50" onClick={() => setShowEmojiPicker(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 h-[50vh] max-h-[600px]" 
               onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Emojis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Category Tabs */}
            <div className="flex border-b bg-gray-50 overflow-x-auto">
              {Object.entries(emojiCategories).map(([key, category], index) => (
                <button
                  key={key}
                  onClick={() => setEmojiCategory(index)}
                  className={cn(
                    "flex-1 px-4 py-3 text-center transition-colors whitespace-nowrap text-sm font-medium",
                    emojiCategory === index 
                      ? "bg-white border-b-2 border-blue-500 text-blue-600" 
                      : "hover:bg-gray-100 text-gray-600"
                  )}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-8 gap-2">
                {Object.values(emojiCategories)[emojiCategory]?.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (emojiTarget === 'content') {
                        setContent(prev => prev + emoji);
                      } else if (emojiTarget === 'note') {
                        setNewNoteText(prev => prev + emoji);
                      } else if (emojiTarget === 'reply') {
                        setReplyText(prev => prev + emoji);
                      }
                      setShowEmojiPicker(false);
                    }}
                    className="p-3 text-2xl hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                )) || []}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Selection Modal */}
      <PlatformSelectionModal
        open={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        selectedPlatforms={selectedPlatforms}
        onSelectionChange={setSelectedPlatforms}
      />

      {/* Platform Preview Panel */}
      {showPreviewPanel && (
        <div className="fixed inset-0 z-[150] bg-black bg-opacity-50" onClick={() => setShowPreviewPanel(false)}>
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">Post Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreviewPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Platform Tabs */}
            <div className="flex border-b bg-gray-50">
              {selectedPlatforms.map((platformId) => {
                const platform = platforms.find(p => p.id === platformId);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <button
                    key={platformId}
                    className="flex-1 p-3 flex items-center justify-center gap-2 hover:bg-gray-100 border-b-2 border-blue-500"
                  >
                    <Icon className={cn("h-4 w-4", platform.color)} />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedPlatforms.map((platformId) => {
                const platform = platforms.find(p => p.id === platformId);
                if (!platform) return null;
                
                return (
                  <div key={platformId} className="mb-6">
                    {/* Instagram Preview */}
                    {platformId === 'instagram' && (
                      <div className="bg-white border rounded-lg overflow-hidden shadow-sm max-w-sm mx-auto">
                        {/* Header */}
                        <div className="flex items-center p-3">
                          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="font-semibold text-sm">your_brand</p>
                            <p className="text-xs text-gray-500">Sponsored</p>
                          </div>
                        </div>
                        
                        {/* Media */}
                        {attachedMedia.length > 0 && (
                          <div className="aspect-square bg-gray-100">
                            {attachedMedia[0].type === 'image' ? (
                              <img src={attachedMedia[0].url} alt="Post content" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Play className="h-12 w-12 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="p-3">
                          <div className="flex items-center mb-2">
                            <Heart className="h-6 w-6 mr-3" />
                            <MessageCircle className="h-6 w-6 mr-3" />
                            <Send className="h-6 w-6 mr-auto" />
                            <Bookmark className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-semibold mb-1">1,234 likes</p>
                          <p className="text-sm">
                            <span className="font-semibold">your_brand </span>
                            {content} {hashtags.map(tag => `#${tag}`).join(' ')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Facebook Preview */}
                    {platformId === 'facebook' && (
                      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        {/* Header */}
                        <div className="flex items-center p-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">YB</span>
                          </div>
                          <div className="ml-3">
                            <p className="font-semibold text-sm">Your Brand</p>
                            <p className="text-xs text-gray-500">5 min · 🌍</p>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="px-4 pb-3">
                          <p className="text-sm">{content} {hashtags.map(tag => `#${tag}`).join(' ')}</p>
                        </div>
                        
                        {/* Media */}
                        {attachedMedia.length > 0 && (
                          <div className="bg-gray-100">
                            {attachedMedia[0].type === 'image' ? (
                              <img src={attachedMedia[0].url} alt="Post content" className="w-full h-auto" />
                            ) : (
                              <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                                <Play className="h-16 w-16 text-white" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="border-t">
                          <div className="flex">
                            <button className="flex-1 py-2 text-center text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                              <ThumbsUp className="h-4 w-4 mr-1" /> Like
                            </button>
                            <button className="flex-1 py-2 text-center text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                              <MessageCircle className="h-4 w-4 mr-1" /> Comment
                            </button>
                            <button className="flex-1 py-2 text-center text-gray-600 hover:bg-gray-50 flex items-center justify-center">
                              <Share className="h-4 w-4 mr-1" /> Share
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Twitter Preview */}
                    {platformId === 'twitter' && (
                      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        {/* Header */}
                        <div className="flex items-start p-3">
                          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">YB</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="font-bold text-sm">Your Brand</p>
                              <span className="text-blue-500 ml-1">✓</span>
                              <p className="text-gray-500 text-sm ml-2">@yourbrand · 2h</p>
                            </div>
                            <p className="text-sm mt-1">{content}</p>
                            {hashtags.length > 0 && (
                              <p className="text-blue-500 text-sm mt-1">
                                {hashtags.map(tag => `#${tag}`).join(' ')}
                              </p>
                            )}
                            
                            {/* Media */}
                            {attachedMedia.length > 0 && (
                              <div className="mt-3 rounded-2xl overflow-hidden border">
                                {attachedMedia[0].type === 'image' ? (
                                  <img src={attachedMedia[0].url} alt="Post content" className="w-full h-auto" />
                                ) : (
                                  <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                                    <Play className="h-12 w-12 text-white" />
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex items-center justify-between mt-3 max-w-md">
                              <button className="flex items-center text-gray-500 hover:text-blue-500">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm">24</span>
                              </button>
                              <button className="flex items-center text-gray-500 hover:text-green-500">
                                <Repeat2 className="h-4 w-4 mr-1" />
                                <span className="text-sm">12</span>
                              </button>
                              <button className="flex items-center text-gray-500 hover:text-red-500">
                                <Heart className="h-4 w-4 mr-1" />
                                <span className="text-sm">156</span>
                              </button>
                              <button className="text-gray-500 hover:text-blue-500">
                                <Share className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* TikTok Preview */}
                    {platformId === 'tiktok' && (
                      <div className="bg-black rounded-lg overflow-hidden shadow-sm max-w-sm mx-auto">
                        {/* Video Area */}
                        <div className="relative aspect-[9/16] bg-gray-900">
                          {attachedMedia.length > 0 ? (
                            attachedMedia[0].type === 'video' ? (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Play className="h-16 w-16 text-white" />
                              </div>
                            ) : (
                              <img src={attachedMedia[0].url} alt="Post content" className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <div className="text-center text-white">
                                <div className="w-16 h-16 border-4 border-white rounded-full mx-auto mb-4"></div>
                                <p className="text-sm">Tap to add media</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Overlay content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-end">
                              <div className="flex-1">
                                <p className="font-semibold text-sm mb-1">@yourbrand</p>
                                <p className="text-sm">{content}</p>
                                {hashtags.length > 0 && (
                                  <p className="text-sm mt-1">
                                    {hashtags.map(tag => `#${tag}`).join(' ')}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-center space-y-4 ml-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                  <Heart className="h-6 w-6 text-red-500" />
                                </div>
                                <span className="text-xs">1.2K</span>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                  <MessageCircle className="h-6 w-6 text-black" />
                                </div>
                                <span className="text-xs">89</span>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                  <Share className="h-6 w-6 text-black" />
                                </div>
                                <span className="text-xs">12</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                setHasUnsavedChanges(false);
                onOpenChange(false);
              }}
            >
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>,
    document.body
  );
}