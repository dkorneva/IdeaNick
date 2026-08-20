import { createElement } from 'react'
import type { IconBaseProps } from 'react-icons'
import { AiFillCloseCircle, AiFillHeart, AiOutlineClose, AiOutlineHeart } from 'react-icons/ai'
import { IoHomeOutline, IoAddCircleOutline, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5'

const icons = {
  likeEmpty: AiOutlineHeart,
  likeFilled: AiFillHeart,
  delete: AiFillCloseCircle,
  close: AiOutlineClose,
  home: IoHomeOutline,
  addIdea: IoAddCircleOutline,
  editProfile: IoPersonOutline,
  logout: IoLogOutOutline,
}

export const Icon = ({ name, ...restProps }: { name: keyof typeof icons } & IconBaseProps) => {
  return createElement(icons[name], restProps)
}
