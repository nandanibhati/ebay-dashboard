import {
  Send,
  Smile,
  Paperclip,
  Image,
  Mic,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

export default function ChatInput({
  onSend,
  replyMessage,
  setReplyMessage,
  onTyping,
  onStopTyping,
}) {
  const [text, setText] = useState("");

  const imageRef = useRef(null);
  const fileRef = useRef(null);

  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);

  const sendMessage = () => {
    if (
      !text.trim() &&
      !image &&
      !file
    )
      return;

    onSend({
      message: text,
      image,
      file,
      replyTo: replyMessage,
    });

    setText("");
    setImage(null);
    setFile(null);

    onStopTyping?.();

    if (setReplyMessage)
      setReplyMessage(null);
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (e.target.value.trim()) {
      onTyping?.();
    } else {
      onStopTyping?.();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white">

      {/* Reply Preview */}

      {replyMessage && (
        <div className="mx-5 mt-4 rounded-xl border-l-4 border-violet-600 bg-violet-50 px-4 py-3 flex items-start justify-between">

          <div>
            <p className="text-xs font-semibold text-violet-600">
              Replying To
            </p>

            <p className="text-sm text-slate-700 truncate">
              {replyMessage.message}
            </p>
          </div>

          <button
            onClick={() =>
              setReplyMessage(null)
            }
          >
            <X
              size={18}
              className="text-slate-500"
            />
          </button>

        </div>
      )}

      {/* Attachment Preview */}

      {(image || file) && (
        <div className="px-5 pt-4">

          {image && (
            <div className="mb-3 rounded-xl border bg-slate-50 p-3 flex justify-between">

              <div>
                <p className="font-semibold">
                  Image Selected
                </p>

                <p className="text-sm text-slate-500">
                  {image.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setImage(null)
                }
              >
                <X size={18} />
              </button>

            </div>
          )}

          {file && (
            <div className="rounded-xl border bg-slate-50 p-3 flex justify-between">

              <div>
                <p className="font-semibold">
                  File Selected
                </p>

                <p className="text-sm text-slate-500">
                  {file.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setFile(null)
                }
              >
                <X size={18} />
              </button>

            </div>
          )}

        </div>
      )}

      <div className="flex items-center gap-3 p-5">

        <button className="w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <Smile size={20} />
        </button>

        <button
          onClick={() =>
            imageRef.current.click()
          }
          className="w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center"
        >
          <Image size={20} />
        </button>

        <button
          onClick={() =>
            fileRef.current.click()
          }
          className="w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center"
        >
          <Paperclip size={20} />
        </button>

        <input
          hidden
          ref={imageRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(
              e.target.files[0]
            )
          }
        />

        <input
          hidden
          ref={fileRef}
          type="file"
          onChange={(e) =>
            setFile(
              e.target.files[0]
            )
          }
        />

        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-slate-200 px-5 py-3 outline-none focus:border-violet-600"
        />
                {/* Voice */}

        <button
          className="w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
        >
          <Mic size={20} />
        </button>

        {/* Send */}

        <button
          onClick={sendMessage}
          className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg transition"
        >
          <Send size={20} />
        </button>

      </div>

      {/* Typing */}

      {text.trim() !== "" && (
        <div className="px-6 pb-3">

          <p className="text-xs text-violet-500 animate-pulse">
            Typing...
          </p>

        </div>
      )}

    </div>
  );
}