import { appActions } from "app/app-reducer";
import { ResponseType } from "common/types/common.types";
import { Dispatch } from "redux";

/**
 * Обрабатывает ошибки, полученные от сервера, и устанавливает соответствующее состояние приложения.
 * @template D
 * @param {ResponseType<D>} data - Данные ответа сервера.
 * @param {Dispatch} dispatch - Функция диспетчера из redux для обновления состояния приложения.
 * @param {boolean} [showError=true] - Флаг, указывающий, нужно ли отображать ошибку пользователю.
 */
export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch, showError: boolean = true) => {
    if (showError) {
        dispatch(
            appActions.setAppError(
                data.messages.length ? { error: data.messages[0] } : { error: "Some error occurred" },
            ),
        );
    }

    dispatch(appActions.setAppStatus({ status: "failed" }));
};
