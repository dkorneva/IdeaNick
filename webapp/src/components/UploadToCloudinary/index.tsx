/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type CloudinaryUploadTypeName,
  type CloudinaryUploadPresetName,
  getCloudinaryUploadUrl,
} from '@IdeaNick/shared/src/cloudinary'
import cn from 'classnames'
import { type FormikProps } from 'formik'
import memoize from 'lodash/memoize'
import { useCallback, useRef, useState } from 'react'
import { trpc } from '../../lib/trpc'
import { Button } from '../Button'
import { Icon } from '../Icon'
import css from './index.module.scss'

export const useUploadToCloudinary = (type: CloudinaryUploadTypeName) => {
  const prepareCloudinaryUpload = trpc.prepareCloudinaryUpload.useMutation()

  const getPreparedData = useCallback(
    memoize(
      async () => {
        const { preparedData } = await prepareCloudinaryUpload.mutateAsync({ type })
        return preparedData
      },
      () => JSON.stringify({ type, minutes: new Date().getMinutes() })
    ),
    [type]
  )

  const uploadToCloudinary = async (file: File) => {
    const preparedData = await getPreparedData()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('timestamp', preparedData.timestamp)
    formData.append('folder', preparedData.folder)
    formData.append('transformation', preparedData.transformation)
    formData.append('eager', preparedData.eager)
    formData.append('signature', preparedData.signature)
    formData.append('api_key', preparedData.apiKey)

    return await fetch(preparedData.url, {
      method: 'POST',
      body: formData,
    })
      .then(async (rawRes) => {
        return await rawRes.json()
      })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error.message)
        }
        return {
          publicId: res.public_id as string,
          res,
        }
      })
  }
  return { uploadToCloudinary }
}

export const UploadToCloudinary = <TTypeName extends CloudinaryUploadTypeName>({
  label,
  name,
  formik,
  type,
  // preset необходим для того, чтобы показывать preview файла
  preset,
}: {
  label: string
  name: string
  formik: FormikProps<any>
  type: TTypeName
  preset: CloudinaryUploadPresetName<TTypeName>
}) => {
  const value = formik.values[name]
  const error = formik.errors[name] as string | undefined
  const touched = formik.touched[name] as boolean
  const invalid = touched && !!error
  const disabled = formik.isSubmitting

  const inputEl = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const { uploadToCloudinary } = useUploadToCloudinary(type)

  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
      <input
        className={css.fileInput}
        type="file"
        disabled={loading || disabled}
        accept="image/*"
        ref={inputEl}
        onChange={({ target: { files } }) => {
          void (async () => {
            setLoading(true)
            try {
              if (files?.length) {
                const file = files[0]
                const { publicId } = await uploadToCloudinary(file)
                void formik.setFieldValue(name, publicId)
              }
            } catch (err: any) {
              console.error(err)
              formik.setFieldError(name, err.message)
            } finally {
              void formik.setFieldTouched(name, true, false)
              setLoading(false)
              // сброс значение текущего файла, нужно для обработки ситуации, когда пользователь загружает файл с тем же именем, чтобы не срабатывал onClick
              if (inputEl.current) {
                inputEl.current.value = ''
              }
            }
          })()
        }}
      />
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      {!!value && !loading && (
        <div className={css.previewPlace}>
          <img className={css.preview} src={getCloudinaryUploadUrl(value, type, preset)} alt="" />
          <button
            type="button"
            className={css.delete}
            onClick={() => {
              void formik.setFieldValue(name, null)
              formik.setFieldError(name, undefined)
              void formik.setFieldTouched(name)
            }}
            disabled={disabled}
          >
            <Icon className={css.deleteIcon} name="delete" />
          </button>
        </div>
      )}
      <div className={css.buttons}>
        <Button type="button" onClick={() => inputEl.current?.click()} loading={loading || disabled} color="blue">
          {value ? 'Upload another' : 'Upload'}
        </Button>
      </div>
      {invalid && <div className={css.error}>{error}</div>}
    </div>
  )
}
