from label_maker import LabelMaker
from label import LabelList
from label_utils import get_skips_dict
import logging
import json
import os

def generate_pdf(formData):
    
    data = json.loads(formData)
    if not data:
        return None

    labels = data.get('labels')
    sheet_type = data.get('sheet_type', "LCRY-1700")
    skip_labels = data.get('skip_labels', None)
    start_label = data.get('start_label', None)
    border = data.get('border', False)
    font_size = data.get('font_size', 12)
    padding = data.get('padding', 1.75)
    text_anchor = data.get('text_anchor', 'middle')
    save_path = data.get('save_path', os.path.join(os.path.expanduser("~"), 'labels.pdf'))


    if not labels:
        raise ValueError("No labels provided")

    input_labels = LabelList(labels).get_label_texts()
    used_label_dict = get_skips_dict(skip_labels, sheet_type, start_label)

    label_maker = LabelMaker(
        input_labels=input_labels,
        used_label_dict=used_label_dict,
        sheet_type=sheet_type,
        border=border,
        padding_value=padding,
        font_size=font_size,
        text_anchor=text_anchor)

    label_maker.save(save_path)
    os.startfile(save_path)
    return 'success'


if __name__ == "__main__":
    import sys
    import json
    import os
    import logging

    try:
        formData = sys.argv[1]
        result = generate_pdf(formData)

        if result == 'success':
            print('success')  # stdout for Electron to detect
            sys.exit(0)
        # else:
        #     print(result, file=sys.stderr)  # send errors to stderr
        #     sys.exit(1)

    except PermissionError:
        print(f"The file is currently open. Please close it and try again.", file=sys.stderr)
        sys.exit(1)

    except Exception as e:
        print(f"Unhandled error: {str(e)}", file=sys.stderr)
        sys.exit(1)