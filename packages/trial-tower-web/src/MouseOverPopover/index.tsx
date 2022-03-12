import { FC, HTMLAttributes, useState } from 'react'
import { Popover } from '@mui/material'

const MouseOverPopover: FC<
  {
    popupContent: React.ReactNode
  } & HTMLAttributes<HTMLSpanElement>
> = (props) => {
  const { popupContent, children, ...spanAttrs } = props
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(undefined)
  }

  const open = Boolean(anchorEl)

  return (
    <span
      {...spanAttrs}
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
    >
      {children}

      <Popover
        sx={{
          pointerEvents: 'none',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {popupContent}
      </Popover>
    </span>
  )
}

export default MouseOverPopover
